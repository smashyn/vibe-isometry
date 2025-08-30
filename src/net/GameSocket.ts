import { apiBasePath } from '../config/apiConfig.js';
import { getCookie } from '../utils/cookie.js';

type GameSocketListener = (data: any) => void;

export class GameSocket {
    private ws: WebSocket;
    private listeners: GameSocketListener[] = [];
    private token: string | null = null;
    private username: string | null = null;
    private url: string;

    constructor(url: string) {
        this.url = url;

        this.token = getCookie('token') ?? null;

        if (!this.username) {
            fetch(`${apiBasePath}/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token: this.token }),
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Token verification failed');
                    }
                    return response.json();
                })
                .then((data) => {
                    this.username = data.username;
                    console.log('Username verified:', this.username);
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
            } catch {
                // ignore
            }
        });
    }

    send(data: any) {
        if (this.token) {
            data.token = this.token;
        }

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

    onMessage(cb: GameSocketListener) {
        this.listeners.push(cb);
    }
}
