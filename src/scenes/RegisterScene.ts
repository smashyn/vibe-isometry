import { Scene } from '../engine/index.js';
import { apiBasePath } from '../config/apiConfig.js';
import { drawText } from '../utils/drawText.js';
import { Input } from '../ui/Input.js';
import { Button } from '../ui/Button.js';

export class RegisterScene implements Scene {
    public isActive = true;
    private onRegisterSuccess: (username: string, password: string) => void;
    private error: string = '';
    private focusField: 'username' | 'password' | 'button' = 'username';

    private usernameInput: Input;
    private passwordInput: Input;
    private registerButton: Button;

    constructor(onRegisterSuccess: (username: string, password: string) => void) {
        this.onRegisterSuccess = onRegisterSuccess;

        this.usernameInput = new Input(
            window.innerWidth / 2 - 120,
            window.innerHeight / 2 - 20,
            240,
            32,
            "Ім'я користувача",
            '',
            'text',
        );
        this.passwordInput = new Input(
            window.innerWidth / 2 - 120,
            window.innerHeight / 2 + 60,
            240,
            32,
            'Пароль',
            '',
            'password',
        );
        this.registerButton = new Button(
            window.innerWidth / 2 - 60,
            window.innerHeight / 2 + 120,
            120,
            40,
            'Зареєструватися',
            () => this.register(),
            () => this.isActive,
        );
    }

    onActivate() {
        this.isActive = true;
        window.addEventListener('keydown', this.handleKeyDown);
        const canvas = (window as any).engine?.canvas || document.querySelector('canvas');
        if (canvas) canvas.addEventListener('click', this.handleClick);
    }

    onDeactivate() {
        this.isActive = false;
        window.removeEventListener('keydown', this.handleKeyDown);
        const canvas = (window as any).engine?.canvas || document.querySelector('canvas');
        if (canvas) canvas.removeEventListener('click', this.handleClick);
        this.registerButton.onDeactivate();
    }

    update(delta: number): void {}

    render(ctx: CanvasRenderingContext2D): void {
        const { width, height } = ctx.canvas;
        ctx.fillStyle = '#181c22';
        ctx.fillRect(0, 0, width, height);

        // Заголовок
        drawText(ctx, 'Реєстрація', width / 2, height / 2 - 100, 'bold 32px Arial', '#222');

        // Username Input
        this.usernameInput.x = width / 2 - 120;
        this.usernameInput.y = height / 2 - 20;
        this.usernameInput.focused = this.focusField === 'username';
        this.usernameInput.render(ctx);

        // Password Input
        this.passwordInput.x = width / 2 - 120;
        this.passwordInput.y = height / 2 + 60;
        this.passwordInput.focused = this.focusField === 'password';
        this.passwordInput.render(ctx);

        // Button
        this.registerButton.x = width / 2 - 60;
        this.registerButton.y = height / 2 + 120;
        this.registerButton.focused = this.focusField === 'button';
        this.registerButton.render(ctx);

        // Error
        if (this.error) {
            drawText(ctx, this.error, width / 2, height / 2 + 190, '16px Arial', '#d32f2f');
        }
    }

    private handleKeyDown = (e: KeyboardEvent) => {
        if (this.focusField === 'username') {
            if (this.usernameInput.onKey(e)) return;
            if (e.key === 'Tab' || e.key === 'Enter') {
                this.focusField = 'password';
                e.preventDefault();
            }
        } else if (this.focusField === 'password') {
            if (this.passwordInput.onKey(e)) return;
            if (e.key === 'Tab') {
                this.focusField = 'button';
                e.preventDefault();
            } else if (e.key === 'Enter') {
                this.focusField = 'button';
                e.preventDefault();
            }
        } else if (this.focusField === 'button') {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.register();
            } else if (e.key === 'Tab') {
                this.focusField = 'username';
                e.preventDefault();
            }
        }
    };

    private handleClick = (e: MouseEvent) => {
        const canvas = (window as any).engine?.canvas || document.querySelector('canvas');
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (this.usernameInput.setActiveByMouse(x, y)) {
            this.focusField = 'username';
        } else if (this.passwordInput.setActiveByMouse(x, y)) {
            this.focusField = 'password';
        } else if (this.registerButton.contains(x, y)) {
            this.focusField = 'button';
            this.register();
        }
    };

    private register() {
        const username = this.usernameInput.value.trim();
        const password = this.passwordInput.value;
        if (!username || !password) {
            this.error = 'Введіть логін і пароль';
            return;
        }
        fetch(`${apiBasePath}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data === true || data.success) {
                    this.onDeactivate();
                    this.onRegisterSuccess(username, password);
                } else {
                    this.error = data.error || 'Користувач вже існує';
                }
            })
            .catch(() => {
                this.error = 'Помилка зʼєднання з сервером';
            });
    }

    destroy() {
        this.onDeactivate();
    }
}
