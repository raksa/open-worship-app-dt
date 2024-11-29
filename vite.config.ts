import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

const resolveAlias = {
    '/pdf.worker.js': 'node_modules/pdfjs-dist/build/pdf.worker.js',
};

const htmlPlugin = () => {
    return {
        name: 'html-transform',
        transformIndexHtml(html: string) {
            // <!-- prod<meta ..>prod -->
            html = html.replace(/<!-- prod/g, '');
            html = html.replace(/prod -->/g, '');
            // <!-- prod<meta ..>prod -->
            /*
            <!-- open-dev -->
            <meta ..>
            <!-- close-dev -->
            */
            html = html.split('<!-- open-dev -->').map((htmlChunk) => {
                const htmlChunkArr = htmlChunk.split('<!-- close-dev -->');
                if (htmlChunkArr.length > 1) {
                    htmlChunkArr.shift();
                }
                return htmlChunkArr.join('');
            }).join('');
            return html;
        },
    };
};

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        htmlPlugin(),
        basicSsl({
            name: 'localhost',
            domains: ['localhost'],
            certDir: '.devServer/cert',
        }),
    ],
    css: {
        preprocessorOptions: {
            scss: {
                api: 'modern-compiler', // or "modern"
            },
        },
    },
    server: {
        port: 3000,
    },
    resolve: {
        alias: resolveAlias,
    },
    build: {
        rollupOptions: {
            input: [
                'index.html', 'screen.html', 'finder.html',
            ].map(item => resolve(item)),
        },
    },
});
