import { copyFileSync } from 'node:fs';
import { resolve } from 'node:path';


const filesToCopy = [
    [
        'node_modules/pdfjs-dist/build/pdf.worker.js',
        'dist/assets/js/',
    ],
];

filesToCopy.forEach(([src, dest]) => {
    const from = resolve(src);
    const to = resolve(dest);
    copyFileSync(from, to);
    console.log(`Copied "${from}" -> "${to}"`);
});
