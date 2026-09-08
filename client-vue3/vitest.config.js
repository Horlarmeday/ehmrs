import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
export default defineConfig({
    plugins: [vue()],
    test: {
        globals: true,
        environment: 'jsdom',
        include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            include: ['src/**/*'],
        },
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },
});
