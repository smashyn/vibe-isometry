class MapRenderer {
    render(ctx: CanvasRenderingContext2D, map: any): void {
        ctx.save();
        ctx.font = '32px Arial';
        ctx.fillStyle = 'black';
        ctx.fillText('MapRenderer', 50, 50);

        // Якщо в карті є tiles, покажемо їх кількість
        if (map && map.tiles && Array.isArray(map.tiles)) {
            ctx.font = '20px Arial';
            ctx.fillStyle = 'green';
            ctx.fillText(`Tiles: ${map.tiles.length} x ${map.tiles[0]?.length || 0}`, 50, 90);
        }

        // Якщо є секції, покажемо їх кількість
        if (map && map.sections && Array.isArray(map.sections)) {
            ctx.font = '20px Arial';
            ctx.fillStyle = 'blue';
            ctx.fillText(`Sections: ${map.sections.length}`, 50, 120);
        }

        ctx.restore();
    }
}

export { MapRenderer };
