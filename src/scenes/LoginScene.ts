import { Scene } from '../engine/index.js';
import { GameSocket } from '../net/GameSocket.js';
import { apiBasePath } from '../config/apiConfig.js';
import { Button } from '../ui/Button.js';
import { Input } from '../ui/Input.js';
import { setCookie, getCookie } from '../utils/cookie.js';

export class LoginScene implements Scene {
    private onLoginSuccess: (username: string, token: string) => void;
    private onRegister: () => void;
    private error: string = '';
    private focusField: 'username' | 'password' | 'button' | 'register' = 'username';

    private loginButton: Button;
    private registerButton: Button;
    private usernameInput: Input;
    private passwordInput: Input;
    public isActive = true;

    constructor(
        onLoginSuccess: (username: string, token: string) => void,
        onRegister: () => void,
        username: string = '',
        password: string = '',
    ) {
        this.onLoginSuccess = onLoginSuccess;
        this.onRegister = onRegister;

        // Інпути
        this.usernameInput = new Input(
            window.innerWidth / 2 - 120,
            window.innerHeight / 2 - 20,
            240,
            32,
            "Ім'я користувача",
            username,
            'text',
        );
        this.passwordInput = new Input(
            window.innerWidth / 2 - 120,
            window.innerHeight / 2 + 60,
            240,
            32,
            'Пароль',
            password,
            'password',
        );

        // Кнопки
        this.loginButton = new Button(
            window.innerWidth / 2 - 60,
            window.innerHeight / 2 + 120,
            120,
            40,
            'Увійти',
            () => this.login(),
            () => this.isActive,
        );
        this.registerButton = new Button(
            window.innerWidth / 2 - 60,
            window.innerHeight / 2 + 180,
            120,
            40,
            'Реєстрація',
            () => {
                this.onRegister();
            },
            () => this.isActive,
        );

        // Автоматичний логін по токену з кукі
        const token = getCookie('token');
        if (token) {
            fetch(`${apiBasePath}/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token }),
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.success && data.username) {
                        this.onLoginSuccess(data.username, token);
                    }
                });
        }
    }

    update(): void {}

    render(ctx: CanvasRenderingContext2D): void {
        const { width, height } = ctx.canvas;
        ctx.fillStyle = '#181c22';
        ctx.fillRect(0, 0, width, height);

        ctx.save();
        ctx.textAlign = 'center';
        ctx.font = 'bold 32px Arial';
        ctx.fillStyle = '#222';
        ctx.fillText('Вхід', width / 2, height / 2 - 100);

        ctx.font = '20px Arial';
        ctx.textAlign = 'left';

        // Інпути
        this.usernameInput.x = width / 2 - 120;
        this.usernameInput.y = height / 2 - 20;
        this.passwordInput.x = width / 2 - 120;
        this.passwordInput.y = height / 2 + 60;
        this.usernameInput.focused = this.focusField === 'username';
        this.passwordInput.focused = this.focusField === 'password';
        this.usernameInput.render(ctx);
        this.passwordInput.render(ctx);

        // Кнопки
        this.loginButton.x = width / 2 - 60;
        this.loginButton.y = height / 2 + 120;
        this.registerButton.x = width / 2 - 60;
        this.registerButton.y = height / 2 + 180;
        this.loginButton.render(ctx);
        this.registerButton.render(ctx);

        // Error
        if (this.error) {
            ctx.font = '16px Arial';
            ctx.fillStyle = '#d32f2f';
            ctx.fillText(this.error, width / 2, height / 2 + 250);
        }
        ctx.restore();
    }

    onActivate() {
        this.isActive = true;
        window.addEventListener('keydown', this.handleKeyDown, { capture: true });
        const canvas = (window as any).engine?.canvas || document.querySelector('canvas');
        if (canvas) canvas.addEventListener('click', this.handleClick);
    }

    onDeactivate() {
        this.isActive = false;
        window.removeEventListener('keydown', this.handleKeyDown);
        const canvas = (window as any).engine?.canvas || document.querySelector('canvas');
        if (canvas) canvas.removeEventListener('click', this.handleClick);
        this.loginButton.onDeactivate();
        this.registerButton.onDeactivate();
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
                this.login();
            } else if (e.key === 'Tab') {
                this.focusField = 'register';
                e.preventDefault();
            }
        } else if (this.focusField === 'register') {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.onRegister();
            } else if (e.key === 'Tab') {
                this.focusField = 'username';
                e.preventDefault();
            }
        }
    };

    private handleClick = (e: MouseEvent) => {
        // Використовуємо engine.canvas для отримання канвасу
        // Припускаємо, що engine є глобальним або імпортованим
        const canvas = (window as any).engine?.canvas || document.querySelector('canvas');
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (this.usernameInput.setActiveByMouse(x, y)) {
            this.focusField = 'username';
        } else if (this.passwordInput.setActiveByMouse(x, y)) {
            this.focusField = 'password';
        }
    };

    private login() {
        const username = this.usernameInput.value.trim();
        const password = this.passwordInput.value;
        if (!username || !password) {
            this.error = 'Введіть логін і пароль';
            return;
        }
        fetch(`${apiBasePath}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success && data.token) {
                    setCookie('token', data.token, 365);
                    this.onLoginSuccess(username, data.token);
                } else {
                    this.error = data.error || 'Невірний логін або пароль';
                }
            })
            .catch(() => {
                this.error = 'Помилка зʼєднання з сервером';
            });
    }
}
