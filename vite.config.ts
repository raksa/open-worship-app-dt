import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import basicSsl from '@vitejs/plugin-basic-ssl';

const resolveAlias = {
    '/js/pdf.worker.js': 'node_modules/pdfjs-dist/build/pdf.worker.js',
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
        basicSsl({
            name: 'localhost',
            domains: ['localhost'],
            certDir: '.devServer/cert',
          }),
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
