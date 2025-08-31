import { Scene } from '../Scene.js';
import { Button } from '../../ui/Button.js';
import { drawText } from '../../utils/drawText.js';
import { GameSocket } from '../../net/GameSocket.js';
import { Input } from '../../ui/Input.js';
import { sceneManager } from '../../SceneManager.js';
import { MainScene } from '../../scenes/game/MainScene.js';
import { setCookie } from '../../utils/cookie.js';

type ChatMessage = {
    sender: string;
    text: string;
    timestamp: number;
};

type Room = {
    id: string;
    name: string;
    admin: string;
    players: string[];
    chat?: ChatMessage[];
};

export class RoomDetailsScene implements Scene {
    public isActive = true;
    private gameSocket: GameSocket;
    private room: Room;
    private onLeave: () => void;
    private leaveButton: Button;
    private chatInput: Input;
    private sendButton: Button;
    private chat: ChatMessage[] = [];
    private username: string;
    private startGameButton: Button;

    constructor(room: Room, onLeave: () => void) {
        this.gameSocket = sceneManager.gameSocket;
        this.room = room;

        console.log('room:', room);
        this.username = this.gameSocket.getUsername();
        this.onLeave = onLeave;

        this.leaveButton = new Button(
            'Вийти',
            () => this.leaveRoom(),
            () => this.isActive,
            { width: 120, height: 40, fillColor: '#d32f2f', fillColorHovered: '#b71c1c' },
        );

        this.startGameButton = new Button(
            'Почати гру',
            () => this.startGame(),
            () => this.isActive && this.room.admin === this.username,
            { width: 180, height: 40, fillColor: '#388e3c', fillColorHovered: '#2e7031' },
        );

        this.chatInput = new Input('', '', 'text', {
            width: 400,
            placeholder: 'Введіть повідомлення...',
        });
        this.sendButton = new Button(
            'Надіслати',
            () => this.sendMessage(),
            () => this.isActive,
            { width: 120, height: 40 },
        );
        this.chat = room.chat || [];
    }

    onActivate() {
        this.isActive = true;
        this.gameSocket.onMessage(this.handleWSMessage);
        window.addEventListener('click', this.handleClick);
        window.addEventListener('keydown', this.handleKeyDown);
        this.requestRoomDetails();
        this.requestChat();
    }

    onDeactivate() {
        this.isActive = false;
        this.leaveButton.onDeactivate();
        this.sendButton.onDeactivate();
        window.removeEventListener('click', this.handleClick);
        window.removeEventListener('keydown', this.handleKeyDown);
    }

    update(): void {}

    render(ctx: CanvasRenderingContext2D): void {
        const { width, height } = ctx.canvas;
        ctx.fillStyle = '#181c22';
        ctx.fillRect(0, 0, width, height);

        // Назва кімнати
        drawText(ctx, this.room.name, width / 2, 60, 'bold 32px Arial', '#fff');

        // Список гравців
        drawText(ctx, 'Гравці:', 80, 120, 'bold 20px Arial', '#fff', 'left');
        let y = 150;
        for (const player of this.room.players) {
            drawText(ctx, player, 100, y, '18px Arial', '#fff', 'left');
            y += 30;
        }

        // Чат
        drawText(ctx, 'Чат:', width / 2, 120, 'bold 20px Arial', '#fff', 'center');
        let chatY = 150;
        const chatX = width / 2 + 40;
        const chatWidth = 500;
        const chatHeight = 300;
        ctx.save();
        ctx.fillStyle = '#222';
        ctx.globalAlpha = 0.7;
        ctx.fillRect(chatX, chatY, chatWidth, chatHeight);
        ctx.globalAlpha = 1;
        ctx.restore();

        // Вивід повідомлень чату (знизу вгору)
        const visibleMessages = this.chat.slice(-10);
        let msgY = chatY + chatHeight - 24;
        for (let i = visibleMessages.length - 1; i >= 0; i--) {
            const msg = visibleMessages[i];
            const time = new Date(msg.timestamp).toLocaleTimeString();
            drawText(
                ctx,
                `[${time}] ${msg.sender}: ${msg.text}`,
                chatX + 10,
                msgY,
                '16px Arial',
                msg.sender === this.username ? '#90caf9' : '#fff',
                'left',
            );
            msgY -= 24;
        }

        // Інпут для чату та кнопка "Надіслати"
        this.chatInput.render(ctx, chatX, chatY + chatHeight + 16);
        this.sendButton.render(ctx, chatX + this.chatInput.width + 16, chatY + chatHeight + 16);

        // Кнопка "Почати гру" (тільки для адміна)
        if (this.room.admin === this.username) {
            this.startGameButton.render(
                ctx,
                width / 2 - this.startGameButton.width / 2,
                height - 100,
            );
        }

        // Кнопка "Вийти"
        this.leaveButton.render(ctx, width - this.leaveButton.width - 40, 40);
    }

    private requestRoomDetails() {
        this.gameSocket.send({ type: 'get_room', id: this.room.id });
    }

    private requestChat() {
        this.gameSocket.send({ type: 'get_chat', roomId: this.room.id });
    }

    private leaveRoom() {
        this.gameSocket.send({ type: 'leave_room', id: this.room.id });
        this.onLeave();
    }

    private sendMessage() {
        const text = this.chatInput.value.trim();
        if (!text) return;
        this.gameSocket.send({ type: 'add_chat_message', roomId: this.room.id, text });
        this.chatInput.value = '';
    }

    private handleWSMessage = (msg: any) => {
        if (msg.type === 'room_details' && msg.room && msg.room.id === this.room.id) {
            this.room = msg.room;
        }
        if (msg.type === 'chat_message' && msg.roomId === this.room.id) {
            this.chat.push({
                sender: msg.sender,
                text: msg.text,
                timestamp: msg.timestamp,
            });
            if (this.chat.length > 50) this.chat = this.chat.slice(-50);
        }
        if (msg.type === 'chat_history' && msg.roomId === this.room.id && Array.isArray(msg.chat)) {
            this.chat = msg.chat;
        }
        if (msg.type === 'left_room' && msg.roomId === this.room.id) {
            this.onLeave();
        }
    };

    private handleClick = (e: MouseEvent) => {
        const canvas = (window as any).engine?.canvas || document.querySelector('canvas');
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Кнопка "Вийти"
        if (this.leaveButton.contains(x, y)) {
            this.leaveButton.onClick();
            return;
        }

        // Кнопка "Почати гру"
        if (this.room.admin === this.username && this.startGameButton.contains(x, y)) {
            this.startGameButton.onClick();
            return;
        }

        // Інпут для чату
        this.chatInput.handleMouseClick(x, y);

        // Кнопка "Надіслати"
        if (this.sendButton.contains(x, y)) {
            this.sendButton.onClick();
            return;
        }
    };

    private handleKeyDown = (e: KeyboardEvent) => {
        // Ввід у чат
        if (this.chatInput.onKey(e)) return;
        // Enter — надіслати повідомлення
        if (e.key === 'Enter') {
            this.sendMessage();
        }
    };

    private startGame() {
        // Тут можна надіслати повідомлення на сервер про старт гри, якщо потрібно
        // this.gameSocket.send({ type: 'start_game', roomId: this.room.id });
        // Перехід на MainScene через менеджер сцен
        sceneManager.setScene(new MainScene('map_1756288095176')); // hardcoded map ID
        setCookie('room', this.room.id, 365); // Зберігаємо кімнату в куки на 1 день
    }
}
