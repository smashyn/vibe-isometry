import { Scene } from '../Scene.js';
import { apiBasePath } from '../../config/apiConfig.js';
import { drawText } from '../../utils/drawText.js';
import { Input } from '../../ui/Input.js';
import { Button } from '../../ui/Button.js';
import { CanvasContext } from '../../engine/CanvasContext.js';
import { drawError } from '../../utils/drawError.js';
import { apiFetch } from '../../utils/apiFetch.js';
import { renderCenteredUI } from '../../utils/renderCenteredUI.js';

export class RestorePasswordScene implements Scene {
    public isActive = true;
    private onRestoreSuccess: () => void;
    private onBack: () => void; // додано
    private error: string = '';
    private info: string = '';
    private focusField: 'email' | 'button' | 'back' = 'email';

    private emailInput: Input;
    private restoreButton: Button;
    private backButton: Button; // додано

    constructor(onRestoreSuccess: () => void, onBack: () => void) {
        this.onRestoreSuccess = onRestoreSuccess;
        this.onBack = onBack;

        this.emailInput = new Input('Email', '', 'text', {
            placeholder: 'Email',
        });
        this.restoreButton = new Button(
            'Відновити',
            () => this.restore(),
            () => this.isActive,
        );
        this.backButton = new Button(
            'Назад',
            () => this.onBack(),
            () => this.isActive,
        );
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
        this.restoreButton.onDeactivate();
        this.backButton.onDeactivate();
    }

    update(delta: number): void {}

    render(ctx: CanvasRenderingContext2D): void {
        const { width, height } = ctx.canvas;
        ctx.fillStyle = '#181c22';
        ctx.fillRect(0, 0, width, height);
        ctx.save();

        this.emailInput.focused = this.focusField === 'email';
        this.restoreButton.focused = this.focusField === 'button';
        this.backButton.focused = this.focusField === 'back';

        renderCenteredUI(ctx, [
            {
                type: 'text',
                text: 'Відновлення пароля',
                font: 'bold 30px sans-serif',
                textAlign: 'center',
            },
            {
                type: 'error',
                text: this.error,
                condition: !!this.error,
            },
            this.emailInput,
            this.restoreButton,
            this.backButton,
        ]);

        ctx.restore();
    }

    private handleKeyDown = (e: KeyboardEvent) => {
        if (this.focusField === 'email') {
            if (this.emailInput.onKey(e)) return;
            if (e.key === 'Tab' || e.key === 'Enter') {
                this.focusField = 'button';
                e.preventDefault();
            }
        } else if (this.focusField === 'button') {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.restore();
            } else if (e.key === 'Tab') {
                this.focusField = 'back';
                e.preventDefault();
            }
        } else if (this.focusField === 'back') {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.onBack();
            } else if (e.key === 'Tab') {
                this.focusField = 'email';
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

        if (this.emailInput.contains(x, y)) {
            this.focusField = 'email';
        } else if (this.restoreButton.contains(x, y)) {
            this.focusField = 'button';
            this.restore();
        } else if (this.backButton.contains(x, y)) {
            this.focusField = 'back';
            this.onBack();
        }
    };

    private restore() {
        const email = this.emailInput.value.trim();
        if (!email) {
            this.error = 'Введіть email';
            return;
        }
        this.error = '';
        this.info = '';
        this.restoreButton.disabled = true;
        apiFetch(`/restore-password`, { method: 'POST' }, { email })
            .then((data) => {
                this.restoreButton.disabled = false;
                if (data.success) {
                    this.info = 'Інструкції надіслано на email';
                    setTimeout(() => {
                        this.onDeactivate();
                        this.onRestoreSuccess();
                    }, 2000);
                } else {
                    this.error = data.error || 'Не вдалося відновити пароль';
                }
            })
            .catch(() => {
                this.restoreButton.disabled = false;
                this.error = 'Помилка зʼєднання з сервером';
            });
    }

    destroy() {
        this.onDeactivate();
    }
}
