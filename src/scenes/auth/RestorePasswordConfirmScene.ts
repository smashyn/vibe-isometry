import { Scene } from '../Scene.js';
import { Button } from '../../ui/Button.js';
import { Input } from '../../ui/Input.js';
import { drawText } from '../../utils/drawText.js';
import { sceneManager } from '../../SceneManager.js';
import { apiFetch } from '../../utils/apiFetch.js';

export class RestorePasswordConfirmScene implements Scene {
    public isActive = true;
    private token: string;
    private passwordInput: Input;
    private submitButton: Button;
    private error: string | null = null;
    private onSuccess: () => void;

    constructor(token: string, onSuccess: () => void) {
        this.token = token;
        this.onSuccess = onSuccess;

        this.passwordInput = new Input('Новий пароль', '', 'password', {
            width: 300,
            placeholder: 'Введіть новий пароль',
        });

        this.submitButton = new Button(
            'Змінити пароль',
            () => this.changePassword(),
            () => this.isActive,
            { width: 180, height: 40, fillColor: '#1976d2', fillColorHovered: '#1565c0' },
        );
    }
    update(delta: number): void {}

    onActivate() {
        this.isActive = true;
        window.addEventListener('click', this.handleClick);
        window.addEventListener('keydown', this.handleKeyDown);
    }

    onDeactivate() {
        this.isActive = false;
        window.removeEventListener('click', this.handleClick);
        window.removeEventListener('keydown', this.handleKeyDown);
    }

    render(ctx: CanvasRenderingContext2D): void {
        const { width, height } = ctx.canvas;
        ctx.fillStyle = '#181c22';
        ctx.fillRect(0, 0, width, height);

        drawText(ctx, 'Відновлення пароля', width / 2, 80, 'bold 32px Arial', '#fff');
        drawText(
            ctx,
            'Введіть новий пароль для вашого акаунта',
            width / 2,
            130,
            '18px Arial',
            '#fff',
        );

        this.passwordInput.render(ctx, width / 2 - 150, 180);
        this.submitButton.render(ctx, width / 2 - 90, 240);

        if (this.error) {
            drawText(ctx, this.error, width / 2, 300, '16px Arial', '#d32f2f');
        }
    }

    private handleClick = (e: MouseEvent) => {
        const canvas = (window as any).engine?.canvas || document.querySelector('canvas');
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.passwordInput.handleMouseClick(x, y);

        if (this.submitButton.contains(x, y)) {
            this.submitButton.onClick();
        }
    };

    private handleKeyDown = (e: KeyboardEvent) => {
        if (this.passwordInput.onKey(e)) return;
        if (e.key === 'Enter') {
            this.changePassword();
        }
    };

    private async changePassword() {
        const newPassword = this.passwordInput.value.trim();
        if (!newPassword || newPassword.length < 6) {
            this.error = 'Введіть новий пароль (мінімум 6 символів)';
            return;
        }
        try {
            const data = await apiFetch(
                '/confirm-reset-password',
                { method: 'POST' },
                { token: this.token, newPassword },
            );
            if (data.success) {
                this.error = null;
                this.onSuccess();
            } else {
                this.error = data.error || 'Не вдалося змінити пароль';
            }
        } catch {
            this.error = 'Помилка зʼєднання з сервером';
        }
    }
}
