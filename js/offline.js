/* ============================================================
   listatread — offline.js
   Экспортирует mountFeedBg(root) — анимированный «поток постов»
   для фона auth-экрана (#auth-feed-bg).

   Используется в main.js:
     import { mountFeedBg } from './offline.js'
     ...
     mountFeedBg(feedBg)

   Стили, на которые опирается модуль (см. style.css):
     .auth-feed-bg
     .offline-col
     .offline-col-inner   (ключевая анимация offlineScroll, 90s)
     .offline-post
   ============================================================ */

export function mountFeedBg(root){
    if(!root) return;
    if(root.dataset.built === '1') return;
    root.dataset.built = '1';

    const POSTS = [
        { name:'listatread', text:'search a trend & list a tred' },
        { name:'nova',       text:'привет, это мой первый пост' },
        { name:'channel',    text:'пост канала — новый тред' },
        { name:'lofi',       text:'ночной плейлист · 1 час' },
        { name:'travel',     text:'утро в горах 🏔' },
        { name:'designer',   text:'сделал новый UI kit, оцените' },
        { name:'bookwarm',   text:'топ-5 книг за год' },
        { name:'artcurator', text:'стрит-арт сегодня 👁' },
        { name:'runner',     text:'10к утром, кто со мной?' },
        { name:'chef',       text:'паста за 15 минут 🍝' },
        { name:'film',       text:'пересматриваю oldboy' },
        { name:'dev',        text:'css grid наконец-то понятен' },
        { name:'photo',      text:'плёнка · portra 400' },
        { name:'plant',      text:'мой монстера дал новый лист 🪴' },
        { name:'barista',    text:'V60 · эфиопия натуральной' },
        { name:'gamer',      text:'новый рекорд в hollow knight' },
    ];

    const NUM_COLS      = 4;
    const POSTS_PER_COL = 8;

    const buildPost = p => `
        <div class="offline-post">
            <div style="display:flex;align-items:center;gap:8px">
                <div style="width:22px;height:22px;border-radius:50%;flex-shrink:0;
                            background:linear-gradient(135deg,#ffd60a,#ff375f)"></div>
                <div style="font-size:11px;color:#fff;font-weight:600">@${p.name}</div>
            </div>
            <div style="font-size:12px;color:rgba(255,255,255,.65);line-height:1.35">${p.text}</div>
            <div style="height:64px;border-radius:10px;
                        background:linear-gradient(135deg,#2a2a2e,#161618)"></div>
        </div>`;

    for(let c = 0; c < NUM_COLS; c++){
        const col = document.createElement('div');
        col.className = 'offline-col';

        const inner = document.createElement('div');
        inner.className = 'offline-col-inner';
        // разные скорости и сдвиги — чтобы колонки двигались несинхронно
        inner.style.animationDuration = (70 + c * 12) + 's';
        inner.style.animationDelay    = (-c * 3) + 's';

        const round = [];
        for(let i = 0; i < POSTS_PER_COL; i++){
            const idx = (c * POSTS_PER_COL + i) % POSTS.length;
            round.push(buildPost(POSTS[idx]));
        }

        // offlineScroll идёт от translateY(0) к translateY(-50%),
        // поэтому для бесшовного цикла нужны два одинаковых блока.
        const html = round.join('');
        inner.innerHTML = html + html;

        col.appendChild(inner);
        root.appendChild(col);
    }
}