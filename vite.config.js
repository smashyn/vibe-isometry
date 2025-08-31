import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        watch: {
            usePolling: true,
            interval: 100,
            ignored: ['!**/server/**'],
        },
    },
});
