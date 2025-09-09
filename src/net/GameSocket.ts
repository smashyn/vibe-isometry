import { getCookie } from '../utils/cookie.js';
import { apiFetch } from '../utils/apiFetch.js';

type GameSocketListener = (data: any) => void;

export class GameSocket {
    private ws: WebSocket;
    private listeners: GameSocketListener[] = [];
    private token: string | null = null;
    private username: string | null = null;
    private url: string;
    private typeListeners: Map<string, GameSocketListener[]> = new Map();

    constructor(url: string) {
        this.url = url;

        this.token = getCookie('token') ?? null;

        if (!this.username) {
            apiFetch(`/verify`, { method: 'POST' }, { token: this.token })
                .then((data) => {
                    this.username = data.username;
                })
                .catch((error) => {
                    console.error('Error verifying token:', error);
                });
        }

        this.ws = new WebSocket(this.url + `?token=${encodeURIComponent(this.token ?? '')}`);
        this.ws.addEventListener('message', (event) => {
            try {
                const data = JSON.parse(event.data);
                this.listeners.forEach((cb) => cb(data));
                if (data.type && this.typeListeners.has(data.type)) {
                    this.typeListeners.get(data.type)!.forEach((cb) => cb(data));
                }
            } catch {
                // ignore
            }
        });
    }

    send(data: any) {
        // ???
        if (this.token) {
            data.token = this.token;
        }

        // ???
        if (this.username) {
            data.username = this.username;
        }

        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        } else {
            this.ws.addEventListener(
                'open',
                () => {
                    this.ws.send(JSON.stringify(data));
                },
                { once: true },
            );
        }
    }

    getUsername() {
        return this.username ?? '';
    }

    getToken() {
        return this.token ?? '';
    }

    onMessage(cb: GameSocketListener) {
        this.listeners.push(cb);
    }

    onType(type: string, cb: GameSocketListener) {
        if (!this.typeListeners.has(type)) {
            this.typeListeners.set(type, []);
        }
        this.typeListeners.get(type)!.push(cb);
    }
}
