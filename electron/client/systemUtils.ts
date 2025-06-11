import { clipboard } from 'electron';
import {
    isDev,
    isWindows,
    isMac,
    isLinux,
    is64System,
    isArm64,
} from '../electronHelpers';

const systemUtils = {
    copyToClipboard(str: string) {
        clipboard.writeText(str);
    },
    isDev,
    isWindows,
    isMac,
    isLinux,
    is64System,
    isArm64,
};

export default systemUtils;
