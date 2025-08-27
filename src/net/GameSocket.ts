type GameSocketListener = (data: any) => void;

export class GameSocket {
    private ws: WebSocket;
    private listeners: GameSocketListener[] = [];

    constructor(url: string) {
        this.ws = new WebSocket(url);
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
