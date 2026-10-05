#!/usr/bin/env python3
import http.server
import socketserver
import socket

PORT = 8000

class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

    def guess_type(self, path):
        if path.endswith('.js') or path.endswith('.mjs'):
            return 'application/javascript'
        if path.endswith('.json'):
            return 'application/json'
        return super().guess_type(path)

    def log_message(self, fmt, *args):
        return

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return '127.0.0.1'

if __name__ == '__main__':
    ip = get_local_ip()
    with socketserver.ThreadingTCPServer(('0.0.0.0', PORT), NoCacheHandler) as httpd:
        httpd.allow_reuse_address = True
        print('-' * 50)
        print(f'  Локально:    http://localhost:{PORT}')
        print(f'  В сети:      http://{ip}:{PORT}')
        print(f'  На телефоне: http://{ip}:{PORT}   (тот же Wi-Fi)')
        print('-' * 50)
        print('  Ctrl+C — остановить')
        print('-' * 50)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print('\nОстановлено.')
