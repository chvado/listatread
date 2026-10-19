/* ============================================================
   directCache.js — IndexedDB-кэш чатов + состояние соединения
   ============================================================ */

const DB_NAME = 'lt_direct_v1';
const DB_VERSION = 1;
const MAX_MESSAGES_PER_CHAT = 200;
const MAX_CHATS = 25;

class IDB {
    constructor(){ this._db = null; this._opening = null; }
    open(){
        if(this._db) return Promise.resolve(this._db);
        if(this._opening) return this._opening;
        this._opening = new Promise((resolve, reject) => {
            const req = indexedDB.open(DB_NAME, DB_VERSION);
            req.onupgradeneeded = () => {
                const db = req.result;
                if(!db.objectStoreNames.contains('chats')){
                    const s = db.createObjectStore('chats', { keyPath: 'peer_id' });
                    s.createIndex('last_message_at', 'last_message_at');
                }
                if(!db.objectStoreNames.contains('messages')){
                    const s = db.createObjectStore('messages', { keyPath: 'id' });
                    s.createIndex('chat_id', 'chat_id');
                    s.createIndex('chat_id_created', ['chat_id', 'created_at']);
                }
                if(!db.objectStoreNames.contains('pending')){
                    db.createObjectStore('pending', { keyPath: 'id' });
                }
                if(!db.objectStoreNames.contains('meta')){
                    db.createObjectStore('meta', { keyPath: 'key' });
                }
            };
            req.onsuccess = () => { this._db = req.result; this._opening = null; resolve(req.result); };
            req.onerror = () => { this._opening = null; reject(req.error); };
        });
        return this._opening;
    }
    async tx(store, mode='readonly'){ const db = await this.open(); return db.transaction(store, mode).objectStore(store); }
    async get(store, key){
        const s = await this.tx(store);
        return new Promise((res, rej) => { const r = s.get(key); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
    }
    async put(store, v){
        const s = await this.tx(store, 'readwrite');
        return new Promise((res, rej) => { const r = s.put(v); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
    }
    async putMany(store, values){
        if(!values.length) return;
        const s = await this.tx(store, 'readwrite');
        return new Promise((res, rej) => {
            let done = 0;
            values.forEach(v => {
                const r = s.put(v);
                r.onsuccess = () => { if(++done === values.length) res(); };
                r.onerror = () => rej(r.error);
            });
        });
    }
    async getAll(store, indexName=null, query=null){
        const s = await this.tx(store);
        const idx = indexName ? s.index(indexName) : s;
        return new Promise((res, rej) => {
            const r = query ? idx.getAll(query) : idx.getAll();
            r.onsuccess = () => res(r.result || []);
            r.onerror = () => rej(r.error);
        });
    }
    async delete(store, key){
        const s = await this.tx(store, 'readwrite');
        return new Promise((res, rej) => { const r = s.delete(key); r.onsuccess = () => res(); r.onerror = () => rej(r.error); });
    }
    async clear(store){
        const s = await this.tx(store, 'readwrite');
        return new Promise((res, rej) => { const r = s.clear(); r.onsuccess = () => res(); r.onerror = () => rej(r.error); });
    }
}
const idb = new IDB();

/* ── CHATS ── */
export const DirectCache = {
    async getChats(){
        const all = await idb.getAll('chats');
        return all.sort((a,b) => (b.last_message_at||0) - (a.last_message_at||0));
    },
    async getChat(peerId){ return idb.get('chats', peerId); },
    async putChat(chat){ return idb.put('chats', chat); },
    async putChats(chats){ return idb.putMany('chats', chats.slice(0, MAX_CHATS)); },
    async deleteChat(peerId){ await idb.delete('chats', peerId); await this.deleteMessages(peerId); },

    /* ── MESSAGES ── */
    async getMessages(peerId, limit = 60){
        const all = await idb.getAll('messages', 'chat_id', peerId);
        all.sort((a,b) => a.created_at - b.created_at);
        return all.slice(-limit);
    },
    async putMessage(msg){ return idb.put('messages', msg); },
    async putMessages(msgs){ if(!msgs.length) return; return idb.putMany('messages', msgs); },
    async deleteMessage(id){ return idb.delete('messages', id); },
    async deleteMessages(peerId){
        const s = await idb.tx('messages', 'readwrite');
        return new Promise((res, rej) => {
            const idx = s.index('chat_id');
            const r = idx.openCursor(IDBKeyRange.only(peerId));
            r.onsuccess = () => { const c = r.result; if(c){ c.delete(); c.continue(); } else res(); };
            r.onerror = () => rej(r.error);
        });
    },

    /* ── PENDING (оффлайн-отправки) ── */
    async getPending(){ return idb.getAll('pending'); },
    async addPending(msg){ return idb.put('pending', msg); },
    async removePending(id){ return idb.delete('pending', id); },

    /* ── META ── */
    async getMeta(k){ const r = await idb.get('meta', k); return r ? r.value : null; },
    async setMeta(k, v){ return idb.put('meta', { key:k, value:v }); },

    /* ── CLEANUP ── */
    async clearAll(){ await idb.clear('chats'); await idb.clear('messages'); await idb.clear('pending'); await idb.clear('meta'); },
    async cleanupOld(maxAgeDays = 30){
        const cutoff = Date.now() - maxAgeDays * 86400_000;
        const s = await idb.tx('messages', 'readwrite');
        return new Promise((res, rej) => {
            const r = s.openCursor();
            r.onsuccess = () => { const c = r.result; if(c){ if((c.value.created_at||0) < cutoff) c.delete(); c.continue(); } else res(); };
            r.onerror = () => rej(r.error);
        });
    },
};

/* ── CONNECTION STATE ── */
export const ConnectionState = {
    _state: navigator.onLine ? 'connecting' : 'offline',
    _listeners: new Set(),
    get state(){ return this._state; },
    isOnline(){ return this._state === 'online'; },
    isOffline(){ return this._state === 'offline'; },
    set(newState){
        if(this._state === newState) return;
        const old = this._state;
        this._state = newState;
        this._listeners.forEach(fn => { try { fn(newState, old); } catch(e){ console.warn(e); } });
        document.dispatchEvent(new CustomEvent('lt-conn-state', { detail: { state:newState, old } }));
    },
    onChange(fn){ this._listeners.add(fn); return () => this._listeners.delete(fn); },
};
window.addEventListener('online',  () => ConnectionState.set('connecting'));
window.addEventListener('offline', () => ConnectionState.set('offline'));

/* ── FETCH WITH BACKOFF ── */
export async function fetchWithRetry(fn, { retries = 2, baseDelay = 400, timeout = 8000 } = {}){
    let lastErr;
    for(let i = 0; i <= retries; i++){
        try {
            const res = await Promise.race([
                fn(),
                new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), timeout)),
            ]);
            ConnectionState.set('online');
            return res;
        } catch(e){
            lastErr = e;
            if(i < retries) await new Promise(r => setTimeout(r, baseDelay * Math.pow(2, i)));
        }
    }
    ConnectionState.set(navigator.onLine ? 'reconnecting' : 'offline');
    throw lastErr;
}

/* ── DIFF CHATS (не перерисовывать всё) ── */
export function diffChats(prev, next){
    const prevMap = new Map(prev.map(c => [c.peer_id, c]));
    const nextMap = new Map(next.map(c => [c.peer_id, c]));
    const added = [], removed = [], changed = [];
    for(const [id, c] of nextMap){
        const old = prevMap.get(id);
        if(!old) added.push(c);
        else if(old.last_message_at !== c.last_message_at || old.unread !== c.unread
            || old.last_message !== c.last_message || old.peer_name !== c.peer_name
            || old.peer_avatar !== c.peer_avatar) changed.push(c);
    }
    for(const id of prevMap.keys()) if(!nextMap.has(id)) removed.push(id);
    return { added, removed, changed };
}

/* ── BANNER helper (единый вид) ── */
export function renderConnBanner(container){
    let el = container.querySelector('.lt-conn-banner');
    if(!el){
        el = document.createElement('div');
        el.className = 'lt-conn-banner hidden';
        container.insertBefore(el, container.firstChild);
    }
    const update = (state) => {
        const map = {
            connecting:   { icon:'◌', text:'Соединение…',                     cls:'connecting' },
            reconnecting: { icon:'↻', text:'Переподключение…',                 cls:'reconnecting' },
            offline:      { icon:'●', text:'Нет соединения — сохранённые чаты', cls:'offline' },
        };
        const cfg = map[state];
        if(!cfg){ el.classList.add('hidden'); return; }
        el.className = `lt-conn-banner ${cfg.cls}`;
        el.innerHTML = `<span class="lt-conn-icon">${cfg.icon}</span><span>${cfg.text}</span>`;
    };
    update(ConnectionState.state);
    const off = ConnectionState.onChange(update);
    return off;
}