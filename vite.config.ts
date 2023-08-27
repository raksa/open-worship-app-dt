import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const htmlPlugin = () => {
    return {
        name: 'html-transform',
        transformIndexHtml(html) {
            return html.replace(
                '<!-- CONTENT_SECURITY_POLICY -->',
                // eslint-disable-next-line quotes
                `<meta http-equiv="Content-Security-Policy" content="script-src 'self' 'unsafe-inline'">`,
            );
        },
    };
};

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), htmlPlugin()],
    server: {
        port: 3000,
    },
    base: './',
    build: {
        rollupOptions: {
            input: ['index.html', 'present.html'],
        },
    },
});
