import { copyFileSync, mkdirSync } from 'node:fs';
import { resolve, join, basename } from 'node:path';


const filesToCopy = [
    [
        'node_modules/pdfjs-dist/build/pdf.worker.js',
        'dist/',
    ],
];

filesToCopy.forEach(([src, dest]) => {
    const from = resolve(src);
    const to = resolve(dest);
    mkdirSync(to, { recursive: true });
    const fileFullName = basename(from);
    copyFileSync(from, join(to, fileFullName));
    console.log(`Copied "${from}" -> "${to}"`);
});
