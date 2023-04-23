import { isDev } from './electronHelpers';
import {
    installExtension,
    REACT_DEVELOPER_TOOLS,
} from 'electron-extension-installer';

export function initExtensions() {
    if (isDev) {
        return installExtension(REACT_DEVELOPER_TOOLS, {
            loadExtensionOptions: {
                allowFileAccess: true,
            },
        });
    }
}
