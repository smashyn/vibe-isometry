export type TabId = 'chat' | 'info' | 'settings';

export class TabsPanel {
    private tabs: {
        id: TabId;
        label: string;
        render: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
    }[];
    private activeTab: TabId;

    private tabTop = 50; // Відступ зверху для табів (нижче кнопок)

    constructor(
        tabs: {
            id: TabId;
            label: string;
            render: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
        }[],
    ) {
        this.tabs = tabs;
        this.activeTab = tabs[0].id;

        // Додаємо обробник кліку по canvas
        const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
        if (canvas) {
            canvas.addEventListener('click', this.handleClick);
        }
    }

    private handleClick = (e: MouseEvent) => {
        const canvas = e.target as HTMLCanvasElement;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const w = canvas.width;
        const gameFieldWidth = w * 0.65;
        // Визначаємо чи клік по табах (30px висота, 100px ширина на таб)
        if (x >= gameFieldWidth && x < w && y >= this.tabTop && y < this.tabTop + 30) {
            const tabIndex = Math.floor((x - gameFieldWidth) / 100);
            if (tabIndex >= 0 && tabIndex < this.tabs.length) {
                this.activeTab = this.tabs[tabIndex].id;
            }
        }
    };

    render(ctx: CanvasRenderingContext2D, w: number, h: number) {
        const gameFieldWidth = w * 0.65;
        ctx.save();
        ctx.font = 'bold 16px sans-serif';
        this.tabs.forEach((tab, i) => {
            ctx.fillStyle = this.activeTab === tab.id ? '#444' : '#222';
            ctx.fillRect(gameFieldWidth + i * 100, this.tabTop, 100, 30);
            ctx.fillStyle = '#fff';
            ctx.fillText(tab.label, gameFieldWidth + i * 100 + 20, this.tabTop + 20);
        });
        ctx.restore();

        // Малюємо активний таб нижче кнопок і табів
        const active = this.tabs.find((t) => t.id === this.activeTab);
        if (active) {
            active.render(ctx, w, h);
        }
    }
}
