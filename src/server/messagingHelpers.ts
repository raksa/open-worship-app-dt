import appProvider, {
    MessageEventType,
} from './appProvider';

export function sendData(channel: string, ...args: any[]) {
    appProvider.messageUtils.sendData(channel, ...args);
}

export function sendSyncData(channel: string, ...args: any[]) {
    return appProvider.messageUtils.sendSyncData(channel, ...args);
}

export function listenForData(channel: string,
    callback: (event: MessageEventType, ...args: any[]) => void) {
    appProvider.messageUtils.listenForData(channel, callback);
}

export function listenOnceForData(channel: string,
    callback: (event: MessageEventType, ...args: any[]) => void) {
    appProvider.messageUtils.listenOnceForData(channel, callback);
}
