import { Scene } from '../engine/index.js';
import { GameSocket } from '../net/GameSocket.js';
import { apiBasePath } from '../config/apiConfig.js'; // Додаємо імпорт

export class RegisterScene implements Scene {
    private onRegisterSuccess: (username: string, password: string) => void;
    private gameSocket: GameSocket;
    private username: string = '';
    private password: string = '';
    private error: string = '';
    private focusField: 'username' | 'password' | 'button' = 'username';

    constructor(
        onRegisterSuccess: (username: string, password: string) => void,
        gameSocket: GameSocket,
    ) {
        this.onRegisterSuccess = onRegisterSuccess;
        this.gameSocket = gameSocket;
        this.setupListeners();
    }

    update(delta: number): void {}

    render(ctx: CanvasRenderingContext2D): void {
        const { width, height } = ctx.canvas;
        ctx.fillStyle = '#181c22';
        ctx.fillRect(0, 0, width, height);

        ctx.save();
        ctx.textAlign = 'center';
        ctx.font = 'bold 32px Arial';
        ctx.fillStyle = '#222';
        ctx.fillText('Реєстрація', width / 2, height / 2 - 100);

        ctx.font = '20px Arial';
        ctx.textAlign = 'left';

        // Username
        ctx.fillStyle = this.focusField === 'username' ? '#1976d2' : '#444';
        ctx.fillText("Ім'я користувача:", width / 2 - 120, height / 2 - 40);
        ctx.strokeStyle = this.focusField === 'username' ? '#1976d2' : '#aaa';
        ctx.strokeRect(width / 2 - 120, height / 2 - 20, 240, 32);
        ctx.fillStyle = '#000';
        ctx.fillText(this.username || '', width / 2 - 115, height / 2 + 2);

        // Password
        ctx.fillStyle = this.focusField === 'password' ? '#1976d2' : '#444';
        ctx.fillText('Пароль:', width / 2 - 120, height / 2 + 40);
        ctx.strokeStyle = this.focusField === 'password' ? '#1976d2' : '#aaa';
        ctx.strokeRect(width / 2 - 120, height / 2 + 60, 240, 32);
        ctx.fillStyle = '#000';
        ctx.fillText(this.password.replace(/./g, '*'), width / 2 - 115, height / 2 + 82);

        // Button
        ctx.fillStyle = this.focusField === 'button' ? '#1976d2' : '#888';
        ctx.fillRect(width / 2 - 60, height / 2 + 120, 120, 40);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Зареєструватися', width / 2, height / 2 + 148);

        // Error
        if (this.error) {
            ctx.font = '16px Arial';
            ctx.fillStyle = '#d32f2f';
            ctx.fillText(this.error, width / 2, height / 2 + 190);
        }
        ctx.restore();
    }

    private setupListeners() {
        window.addEventListener('keydown', this.handleKeyDown);
    }

    private removeListeners() {
        window.removeEventListener('keydown', this.handleKeyDown);
    }

    private handleKeyDown = (e: KeyboardEvent) => {
        if (this.focusField === 'username') {
            if (e.key === 'Tab' || e.key === 'Enter') {
                this.focusField = 'password';
                e.preventDefault();
            } else if (e.key === 'Backspace') {
                this.username = this.username.slice(0, -1);
            } else if (e.key.length === 1 && this.username.length < 32) {
                this.username += e.key;
            }
        } else if (this.focusField === 'password') {
            if (e.key === 'Tab') {
                this.focusField = 'button';
                e.preventDefault();
            } else if (e.key === 'Enter') {
                this.focusField = 'button';
                e.preventDefault();
            } else if (e.key === 'Backspace') {
                this.password = this.password.slice(0, -1);
            } else if (e.key.length === 1 && this.password.length < 32) {
                this.password += e.key;
            }
        } else if (this.focusField === 'button') {
            if (e.key === 'Enter' || e.key === ' ') {
                this.register();
            } else if (e.key === 'Tab') {
                this.focusField = 'username';
                e.preventDefault();
            }
        }
    };

    private register() {
        if (!this.username || !this.password) {
            this.error = 'Введіть логін і пароль';
            return;
        }
        fetch(`${apiBasePath}/register`, {
            // Використовуємо apiBasePath
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: this.username, password: this.password }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data === true || data.success) {
                    this.removeListeners();
                    this.onRegisterSuccess(this.username, this.password);
                } else {
                    this.error = data.error || 'Користувач вже існує';
                }
            })
            .catch(() => {
                this.error = 'Помилка зʼєднання з сервером';
            });
    }

    destroy() {
        this.removeListeners();
    }
}
