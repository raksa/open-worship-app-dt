import { existsSync, rm } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';

const dirPath = resolve(process.argv[2]);
if (!existsSync(dirPath)) {
    process.exit(0);
}
rm(dirPath, { recursive: true, force: true }, (err) => {
    if (err) {
        throw new Error(err);
    }
});
