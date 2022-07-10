import { toastEventListener } from '../event/ToastEventListener';
import appProvider from './appProvider';

export type DisplayType = {
    id: string,
    bounds: { x: number, y: number, width: number, height: number };
};
export function getAllDisplays() {
    return appProvider.ipcRenderer.sendSync('main:app:get-displays') as {
        presentDisplay: DisplayType,
        displays: DisplayType[],
    };
}
export function saveDisplaySetting(data: { presentDisplayId: string }) {
    const success = !!appProvider.ipcRenderer.sendSync('main:app:set-displays', data);
    toastEventListener.showSimpleToast({
        title: 'Save Display',
        message: success ? 'Display setting have been saved' : 'Fail to save display setting',
    });
    return success;
}
