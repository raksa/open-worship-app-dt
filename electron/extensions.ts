import { isDev } from './electronHelpers';

export async function initExtensions() {
    if (isDev) {
        const {
            installExtension,
            REACT_DEVELOPER_TOOLS,
        } = await import('electron-extension-installer');
        await installExtension(REACT_DEVELOPER_TOOLS, {
            loadExtensionOptions: {
                allowFileAccess: true,
            },
        });
    }
}
