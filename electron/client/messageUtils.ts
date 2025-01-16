import { ipcRenderer, IpcRendererEvent } from 'electron';

import { channels } from '../electronEventListener';

const messageUtils = {
    channels,
    sendData(channel: string, ...args: any[]) {
        ipcRenderer.send(channel, ...args);
    },
    sendDataSync(channel: string, ...args: any[]) {
        return ipcRenderer.sendSync(channel, ...args);
    },
    listenForData(
        channel: string,
        callback: (event: IpcRendererEvent, ...args: any[]) => void,
    ) {
        ipcRenderer.on(channel, callback);
    },
    listenOnceForData(
        channel: string,
        callback: (event: IpcRendererEvent, ...args: any[]) => void,
    ) {
        ipcRenderer.once(channel, callback);
    },
};

export default messageUtils;
