import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// TODO: fix bootstrap-icons font path missing
const rootBootstrapIcons = 'node_modules/bootstrap-icons/font/fonts/';
const bootstrapIcons = {
    '/fonts/bootstrap-icons.woff': `${rootBootstrapIcons}bootstrap-icons.woff`,
    '/fonts/bootstrap-icons.woff2:': `${rootBootstrapIcons}bootstrap-icons.woff2`,
    '/modal/fonts/bootstrap-icons.woff': `${rootBootstrapIcons}bootstrap-icons.woff`,
    '/modal/fonts/bootstrap-icons.woff2:': `${rootBootstrapIcons}bootstrap-icons.woff2`,
};

const htmlPlugin = () => {
    return {
        name: 'html-transform',
        transformIndexHtml(html) {
            return html.replace(
                '<!-- CONTENT_SECURITY_POLICY -->',
                // eslint-disable-next-line quotes
                `<meta http-equiv="Content-Security-Policy" content="script-src 'self' 'unsafe-inline'">`,
            ).replace(
                '<script src="http://localhost:8097"></script>', ''
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
    resolve: {
        alias: {
            ...bootstrapIcons,
        },
    },
    base: './',
    build: {
        rollupOptions: {
            input: ['index.html', 'present.html'],
        },
    },
});
