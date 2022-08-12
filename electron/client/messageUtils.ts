import {
    IpcRendererEvent,
} from 'electron';
import { channels } from '../electronEventListener';
const electron = require('electron');

const messageUtils = {
    channels,
    sendData(channel: string, ...args: any[]) {
        electron.ipcRenderer.send(channel, ...args);
    },
    sendSyncData(channel: string, ...args: any[]) {
        return electron.ipcRenderer.sendSync(channel, ...args);
    },
    listenForData(channel: string,
        callback: (event: IpcRendererEvent, ...args: any[]) => void) {
        electron.ipcRenderer.on(channel, callback);
    },
    listenOnceForData(channel: string,
        callback: (event: IpcRendererEvent, ...args: any[]) => void) {
        electron.ipcRenderer.once(channel, callback);
    },
};

export default messageUtils;
