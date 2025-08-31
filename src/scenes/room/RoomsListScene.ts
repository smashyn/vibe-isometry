import { Scene } from '../Scene.js';
import { Button } from '../../ui/Button.js';
import { drawText } from '../../utils/drawText.js';
import { GameSocket } from '../../net/GameSocket.js';
import { Modal } from '../../ui/Modal.js';
import { Input } from '../../ui/Input.js';
import { renderCenteredUI } from '../../utils/renderCenteredUI.js';
import { setCookie } from '../../utils/cookie.js'; // Додайте цей імпорт, якщо ще не додано

type Room = {
    id: string;
    name: string;
    admin: string;
    players: string[];
};

export class RoomsListScene implements Scene {
    public isActive = true;
    private gameSocket: GameSocket;
    private rooms: Room[] = [];
    private joinButtons: Button[] = [];
    private error: string = '';
    private onJoinRoom: (roomId: string) => void;
    private modal: Modal;
    private createRoomButton: Button;
    private roomNameInput: Input;
    private modalCreateButton: Button;
    private quitButton: Button; // Додаємо поле

    constructor(gameSocket: GameSocket, onJoinRoom: (roomId: string) => void) {
        this.gameSocket = gameSocket;
        this.onJoinRoom = onJoinRoom;

        this.createRoomButton = new Button(
            'Створити кімнату',
            () => this.openCreateRoomModal(),
            () => this.isActive,
        );

        // Додаємо кнопку Quit
        this.quitButton = new Button(
            'Quit',
            () => {
                setCookie('token', '', -1); // Видалити токен
                window.location.reload(); // Перезавантажити сторінку або зробити іншу дію
            },
            () => this.isActive,
            { width: 120, height: 40, fillColor: '#d32f2f', fillColorHovered: '#b71c1c' },
        );

        // Інпут для назви кімнати в модалці
        this.roomNameInput = new Input('Room Name', '', 'text', {
            placeholder: 'Назва кімнати',
        });

        // Кнопка "Створити" в модалці
        this.modalCreateButton = new Button(
            'Створити',
            () => this.createRoom(),
            () => this.isActive,
        );

        // Модалка з кастомним рендером
        this.modal = new Modal(
            'Створення кімнати',
            '',
            () => {},
            (ctx) => {
                this.roomNameInput.focused = true;
                renderCenteredUI(ctx, [this.roomNameInput, this.modalCreateButton]);
            },
        );
    }

    onActivate() {
        this.isActive = true;
        this.gameSocket.onMessage(this.handleWSMessage);
        this.requestRooms();
        this.createRoomButton.onActivate();
        this.quitButton.onActivate(); // Додаємо активацію
        window.addEventListener('click', this.handleClick);
        window.addEventListener('keydown', this.handleKeyDown);
    }

    onDeactivate() {
        this.isActive = false;
        this.joinButtons.forEach((btn) => btn.onDeactivate());
        this.createRoomButton.onDeactivate();
        this.quitButton.onDeactivate(); // Додаємо деактивацію
        window.removeEventListener('click', this.handleClick);
        window.removeEventListener('keydown', this.handleKeyDown);
    }

    update(): void {}

    render(ctx: CanvasRenderingContext2D): void {
        const { width, height } = ctx.canvas;
        ctx.fillStyle = '#181c22';
        ctx.fillRect(0, 0, width, height);

        drawText(ctx, 'Список кімнат', width / 2, 60, 'bold 32px Arial', '#fff');

        this.createRoomButton.render(ctx, 40, 40);

        // Рендеримо кнопку Quit у правому верхньому куті
        this.quitButton.render(ctx, width - this.quitButton.width - 40, 40);

        if (this.error) {
            drawText(ctx, this.error, width / 2, 100, '16px Arial', '#d32f2f');
        }

        let y = 120;
        this.joinButtons = [];
        for (const room of this.rooms) {
            drawText(ctx, room.name, 100, y + 20, '20px Arial', '#fff');
            const btn = new Button(
                'Join',
                () => this.joinRoom(room.id),
                () => this.isActive,
            );
            btn.render(ctx, width - 340, y);
            this.joinButtons.push(btn);
            y += 60;
        }

        this.modal.render(ctx, width, height);
    }

    private openCreateRoomModal() {
        this.roomNameInput.value = '';
        this.modal.open();
    }

    private createRoom() {
        const name = this.roomNameInput.value.trim();
        if (!name) return;
        this.gameSocket.send({ type: 'create_room', name });
        this.modal.close();
    }

    private requestRooms() {
        this.gameSocket.send({ type: 'list_rooms' });
    }

    private handleWSMessage = (msg: any) => {
        if (msg.type === 'rooms_list') {
            this.rooms = msg.rooms;
        }
    };

    private joinRoom(roomId: string) {
        this.gameSocket.send({ type: 'join_room', id: roomId });
        this.onJoinRoom(roomId);
    }

    private handleClick = (e: MouseEvent) => {
        const canvas = (window as any).engine?.canvas || document.querySelector('canvas');
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Якщо модалка відкрита — обробляємо тільки її
        if (this.modal.isOpen) {
            // Клік по інпуту (і кнопці очищення)
            this.roomNameInput.handleMouseClick(x, y);

            // Клік по кнопці "Створити"
            if (this.modalCreateButton.contains(x, y)) {
                this.modalCreateButton.onClick();
            }
            // Клік по кнопці "Закрити"
            this.modal.handleClick(x, y, canvas.width, canvas.height);
            return;
        }

        // Кнопка створення кімнати
        if (this.createRoomButton.contains(x, y)) {
            this.createRoomButton.onClick();
            return;
        }

        // Кнопка Quit
        if (this.quitButton.contains(x, y)) {
            this.quitButton.onClick();
            return;
        }

        // Join-кнопки
        for (const btn of this.joinButtons) {
            if (btn.contains(x, y)) {
                btn.onClick();
                return;
            }
        }
    };

    private handleKeyDown = (e: KeyboardEvent) => {
        if (!this.modal.isOpen) return;
        // Ввід у інпут
        if (this.roomNameInput.onKey(e)) return;
        // Enter — створити кімнату
        if (e.key === 'Enter') {
            this.createRoom();
        }
    };
}
