import { Scene } from '../Scene.js';
import { apiBasePath } from '../../config/apiConfig.js';
import { Button } from '../../ui/Button.js';
import { Input } from '../../ui/Input.js';
import { setCookie, getCookie } from '../../utils/cookie.js';
import { apiFetch } from '../../utils/apiFetch.js';
import { CanvasContext } from '../../engine/CanvasContext.js';
import { renderCenteredUI } from '../../utils/renderCenteredUI';
import { sceneManager } from '../../SceneManager.js';
import { MainScene } from '../game/MainScene.js';

export class LoginScene implements Scene {
    private onLoginSuccess: (username: string, token: string) => void;
    private onRegister: () => void;
    private onRestore: () => void;
    private error: string = '';
    private focusField: 'username' | 'password' | 'login' | 'register' | 'restore' = 'username';

    private loginButton: Button;
    private registerButton: Button;
    private restoreButton: Button;
    private usernameInput: Input;
    private passwordInput: Input;
    public isActive = true;

    constructor(
        onLoginSuccess: (username: string, token: string) => void,
        onRegister: () => void,
        onRestore: () => void,
        username: string = '',
        password: string = '',
    ) {
        this.onLoginSuccess = onLoginSuccess;
        this.onRegister = onRegister;
        this.onRestore = onRestore;

        // Інпути
        this.usernameInput = new Input('Username', username, 'text', {
            placeholder: "Ім'я користувача",
        });
        this.passwordInput = new Input('Password', password, 'password', {
            placeholder: 'Пароль',
        });

        // Кнопки
        this.loginButton = new Button(
            'Увійти',
            () => this.login(),
            () => this.isActive,
        );
        this.registerButton = new Button(
            'Реєстрація',
            () => {
                this.onRegister();
            },
            () => this.isActive,
        );
        this.restoreButton = new Button(
            'Забули пароль?',
            () => this.onRestore(),
            () => this.isActive,
        );

        // Автоматичний логін по токену з кукі
        const token = getCookie('token');
        const room = getCookie('room');
        if (token) {
            apiFetch(`${apiBasePath}/verify`, { method: 'POST' }, { token }).then((data) => {
                if (data.success && data.username) {
                    if (room) {
                        sceneManager.setScene(new MainScene('map_1756288095176'));
                    } else {
                        this.onLoginSuccess(data.username, token);
                    }
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

        this.usernameInput.focused = this.focusField === 'username';
        this.passwordInput.focused = this.focusField === 'password';
        this.loginButton.focused = this.focusField === 'login';
        this.registerButton.focused = this.focusField === 'register';
        this.restoreButton.focused = this.focusField === 'restore';

        renderCenteredUI(ctx, [
            {
                type: 'text',
                text: 'Вхід',
                font: 'bold 30px sans-serif',
                textAlign: 'center',
            },
            {
                type: 'error',
                text: this.error,
                condition: !!this.error,
            },
            this.usernameInput,
            this.passwordInput,
            this.loginButton,
            this.registerButton,
            this.restoreButton,
        ]);

        ctx.restore();
    }

    onActivate() {
        this.isActive = true;
        window.addEventListener('keydown', this.handleKeyDown, { capture: true });
        const canvasCtx = CanvasContext.getInstance();
        if (canvasCtx) canvasCtx.canvas.addEventListener('mousedown', this.handleClick);
    }

    onDeactivate() {
        this.isActive = false;
        window.removeEventListener('keydown', this.handleKeyDown);
        const canvasCtx = CanvasContext.getInstance();
        if (canvasCtx) canvasCtx.canvas.removeEventListener('mousedown', this.handleClick);
        this.registerButton.onDeactivate();
        this.restoreButton.onDeactivate();
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
                this.focusField = 'login';
                e.preventDefault();
            } else if (e.key === 'Enter') {
                this.focusField = 'login';
                e.preventDefault();
            }
        } else if (this.focusField === 'login') {
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
                this.focusField = 'restore';
                e.preventDefault();
            }
        } else if (this.focusField === 'restore') {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.onRestore();
            } else if (e.key === 'Tab') {
                this.focusField = 'username';
                e.preventDefault();
            }
        }
    };

    private handleClick = (e: MouseEvent) => {
        const canvasCtx = CanvasContext.getInstance();
        if (!canvasCtx) return;
        const rect = canvasCtx.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Додаємо обробку кліку по кнопці очищення інпутів
        this.usernameInput.handleMouseClick(x, y);
        this.passwordInput.handleMouseClick(x, y);

        if (this.usernameInput.contains(x, y)) {
            this.focusField = 'username';
        } else if (this.passwordInput.contains(x, y)) {
            this.focusField = 'password';
        } else if (this.loginButton.contains(x, y)) {
            this.focusField = 'login';
            this.loginButton.onClick();
        } else if (this.registerButton.contains(x, y)) {
            this.focusField = 'register';
            this.registerButton.onClick();
        } else if (this.restoreButton.contains(x, y)) {
            this.focusField = 'restore';
            this.restoreButton.onClick();
        }
    };

    private login() {
        const username = this.usernameInput.value.trim();
        const password = this.passwordInput.value;
        if (!username || !password) {
            this.error = 'Введіть логін і пароль';
            return;
        }
        this.loginButton.disabled = true;
        apiFetch(`/login`, { method: 'POST' }, { username, password })
            .then((data) => {
                this.loginButton.disabled = false;
                if (data.success && data.token) {
                    setCookie('token', data.token, 365);
                    this.onLoginSuccess(username, data.token);
                } else {
                    this.error = data.error || 'Невірний логін або пароль';
                }
            })
            .catch(() => {
                this.loginButton.disabled = false;
                this.error = 'Помилка зʼєднання з сервером';
            });
    }
}
