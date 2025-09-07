import { Scene } from '../Scene.js';
import { Input } from '../../ui/Input.js';
import { Button } from '../../ui/Button.js';
import { CanvasContext } from '../../engine/CanvasContext.js';
import { apiFetch } from '../../utils/apiFetch.js';
import { renderCenteredUI } from '../../utils/renderCenteredUI.js';

function validateEmail(email: string): boolean {
    // Simple email regex
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export class RegisterScene implements Scene {
    public isActive = true;
    private onRegisterSuccess: (username: string, password: string) => void;
    private onBack: () => void;
    private error: string = '';
    private focusField: 'username' | 'email' | 'password' | 'register' | 'back' = 'username';

    private usernameInput: Input;
    private emailInput: Input;
    private passwordInput: Input;
    private registerButton: Button;
    private backButton: Button;

    constructor(
        onRegisterSuccess: (username: string, password: string) => void,
        onBack: () => void,
    ) {
        this.onRegisterSuccess = onRegisterSuccess;
        this.onBack = onBack;

        this.usernameInput = new Input('Username', '', 'text', {
            placeholder: "Ім'я користувача",
        });
        this.emailInput = new Input('Email', '', 'text', {
            placeholder: 'Email',
        });
        this.passwordInput = new Input('Password', '', 'password', {
            placeholder: 'Пароль',
        });

        this.registerButton = new Button(
            'Зареєструватися',
            () => this.register(),
            () => this.isActive,
        );
        this.backButton = new Button(
            'Назад',
            () => this.onBack(),
            () => this.isActive,
        );

        this.focusField = 'username';
    }

    onActivate() {
        this.isActive = true;
        window.addEventListener('keydown', this.handleKeyDown);
        const canvasCtx = CanvasContext.getInstance();
        if (canvasCtx) canvasCtx.canvas.addEventListener('mousedown', this.handleClick);
    }

    onDeactivate() {
        this.isActive = false;
        window.removeEventListener('keydown', this.handleKeyDown);
        const canvasCtx = CanvasContext.getInstance();
        if (canvasCtx) canvasCtx.canvas.removeEventListener('mousedown', this.handleClick);
        this.registerButton.onDeactivate();
        this.backButton.onDeactivate();
    }

    update(delta: number): void {}

    render(ctx: CanvasRenderingContext2D): void {
        const { width, height } = ctx.canvas;
        ctx.fillStyle = '#181c22';
        ctx.fillRect(0, 0, width, height);
        ctx.save();

        this.usernameInput.focused = this.focusField === 'username';
        this.emailInput.focused = this.focusField === 'email';
        this.passwordInput.focused = this.focusField === 'password';
        this.registerButton.focused = this.focusField === 'register';
        this.backButton.focused = this.focusField === 'back';

        renderCenteredUI(ctx, [
            {
                type: 'text',
                text: 'Реєстрація',
                font: 'bold 30px sans-serif',
                textAlign: 'center',
            },
            {
                type: 'error',
                text: this.error,
                condition: !!this.error,
            },
            this.usernameInput,
            this.emailInput,
            this.passwordInput,
            this.registerButton,
            this.backButton,
        ]);

        ctx.restore();
    }

    private handleKeyDown = (e: KeyboardEvent) => {
        if (this.focusField === 'username') {
            if (this.usernameInput.onKey(e)) return;
            if (e.key === 'Tab' || e.key === 'Enter') {
                this.focusField = 'email';
                e.preventDefault();
            }
        } else if (this.focusField === 'email') {
            if (this.emailInput.onKey(e)) return;
            if (e.key === 'Tab' || e.key === 'Enter') {
                this.focusField = 'password';
                e.preventDefault();
            }
        } else if (this.focusField === 'password') {
            if (this.passwordInput.onKey(e)) return;
            if (e.key === 'Tab') {
                this.focusField = 'register';
                e.preventDefault();
            } else if (e.key === 'Enter') {
                this.focusField = 'register';
                e.preventDefault();
            }
        } else if (this.focusField === 'register') {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.register();
            } else if (e.key === 'Tab') {
                this.focusField = 'back';
                e.preventDefault();
            }
        } else if (this.focusField === 'back') {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.onBack();
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

        if (this.usernameInput.contains(x, y)) {
            this.focusField = 'username';
        } else if (this.emailInput.contains(x, y)) {
            this.focusField = 'email';
        } else if (this.passwordInput.contains(x, y)) {
            this.focusField = 'password';
        } else if (this.registerButton.contains(x, y)) {
            this.focusField = 'register';
            this.register();
        } else if (this.backButton.contains(x, y)) {
            this.focusField = 'back';
            this.onBack();
        }
    };

    private register() {
        const username = this.usernameInput.value.trim();
        const email = this.emailInput.value.trim();
        const password = this.passwordInput.value;
        if (!username || !email || !password) {
            this.error = 'Введіть логін, email і пароль';
            return;
        }
        if (!validateEmail(email)) {
            this.error = 'Некоректний email';
            return;
        }
        this.registerButton.disabled = true;
        apiFetch(`/register`, { method: 'POST' }, { username, email, password })
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
            })
            .finally(() => {
                this.registerButton.disabled = false;
            });
    }

    destroy() {
        this.onDeactivate();
    }
}
