import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';

const resolveAlias = {
    '/js/pdf.worker.js': 'node_modules/pdfjs-dist/build/pdf.worker.js',
};

const htmlPlugin = () => {
    return {
        name: 'html-transform',
        transformIndexHtml(html) {
            return html.replace(
                '<!-- CONTENT_SECURITY_POLICY -->',
                // eslint-disable-next-line quotes
                `<meta http-equiv="Content-Security-Policy" content="script-src`
                + ` 'self' 'unsafe-inline'">`,
            );
        },
    };
};

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        viteStaticCopy({
            targets: Object.entries(resolveAlias).map(([from, to]) => {
                const regex = new RegExp(/^\/(\w+)\//);
                return {
                    src: to,
                    dest: regex.exec(from)?.[1] ?? '',
                };
            }).filter((target) => target.dest !== ''),
        }),
        react(),
        htmlPlugin(),
    ],
    server: {
        port: 3000,
    },
    resolve: {
        alias: resolveAlias,
    },
    build: {
        rollupOptions: {
            input: ['index.html', 'present.html', 'finder.html'],
        },
    },
});
