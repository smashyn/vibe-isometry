import { Scene } from '../engine/index.js';
import { GameSocket } from '../net/GameSocket.js';
import { apiBasePath } from '../config/apiConfig.js';

// Функції для роботи з кукі
function setCookie(name: string, value: string, days = 7) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/';
}
function getCookie(name: string): string | undefined {
    return document.cookie
        .split('; ')
        .find((row) => row.startsWith(name + '='))
        ?.split('=')[1];
}

export class LoginScene implements Scene {
    private onLoginSuccess: (username: string, token: string) => void;
    private onRegister: () => void;
    private gameSocket: GameSocket;
    private username: string;
    private password: string;
    private error: string = '';
    private focusField: 'username' | 'password' | 'button' | 'register' = 'username';

    constructor(
        onLoginSuccess: (username: string, token: string) => void,
        gameSocket: GameSocket,
        onRegister: () => void,
        username: string = '',
        password: string = '',
    ) {
        this.onLoginSuccess = onLoginSuccess;
        this.gameSocket = gameSocket;
        this.onRegister = onRegister;
        this.username = username;
        this.password = password;
        this.setupListeners();

        // --- Перевіряємо токен у кукі при завантаженні сцени ---
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
                        this.removeListeners();
                        this.onLoginSuccess(data.username, token);
                    }
                })
                .catch(() => {
                    // Якщо токен не валідний, нічого не робимо
                });
        }
    }

    update(delta: number): void {}

    render(ctx: CanvasRenderingContext2D): void {
        const { width, height } = ctx.canvas;
        // Темний фон
        ctx.fillStyle = '#181c22';
        ctx.fillRect(0, 0, width, height);

        ctx.save();
        ctx.textAlign = 'center';
        ctx.font = 'bold 32px Arial';
        ctx.fillStyle = '#222';
        ctx.fillText('Вхід', width / 2, height / 2 - 100);

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

        // Button "Увійти"
        ctx.fillStyle = this.focusField === 'button' ? '#1976d2' : '#888';
        ctx.fillRect(width / 2 - 60, height / 2 + 120, 120, 40);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Увійти', width / 2, height / 2 + 148);

        // Button "Реєстрація"
        ctx.fillStyle = this.focusField === 'register' ? '#1976d2' : '#888';
        ctx.fillRect(width / 2 - 60, height / 2 + 180, 120, 40);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px Arial';
        ctx.fillText('Реєстрація', width / 2, height / 2 + 208);

        // Error
        if (this.error) {
            ctx.font = '16px Arial';
            ctx.fillStyle = '#d32f2f';
            ctx.fillText(this.error, width / 2, height / 2 + 250);
        }
        ctx.restore();
    }

    private setupListeners() {
        window.addEventListener('keydown', this.handleKeyDown, { capture: true });
        // Глобально блокуємо Enter/Space якщо focusField на кнопці
        window.addEventListener(
            'keypress',
            (e) => {
                if (
                    (this.focusField === 'button' || this.focusField === 'register') &&
                    (e.key === 'Enter' || e.key === ' ')
                ) {
                    e.preventDefault();
                }
            },
            { capture: true },
        );
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
                e.preventDefault(); // <-- тільки тут!
                this.login();
            } else if (e.key === 'Tab') {
                this.focusField = 'register';
                e.preventDefault();
            }
        } else if (this.focusField === 'register') {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault(); // <-- тільки тут!
                this.removeListeners();
                this.onRegister();
            } else if (e.key === 'Tab') {
                this.focusField = 'username';
                e.preventDefault();
            }
        }
    };

    private login() {
        if (!this.username || !this.password) {
            this.error = 'Введіть логін і пароль';
            return;
        }
        fetch(`${apiBasePath}/login`, {
            // Використовуємо basePath
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: this.username, password: this.password }),
        })
            .then((res) => res.json())
            .then((data) => {
                console.log('Login response:', data);
                if (data.success && data.token) {
                    console.log('Login successful, token:', data.token);
                    setCookie('token', data.token, 365); // Зберігаємо токен у кукі
                    //this.removeListeners();
                    //this.onLoginSuccess(this.username, data.token);
                } else {
                    this.error = data.error || 'Невірний логін або пароль';
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
