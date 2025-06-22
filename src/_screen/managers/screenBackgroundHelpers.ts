import { attachBackgroundManager } from '../../others/AttachBackgroundManager';
import ScreenBackgroundManager from './ScreenBackgroundManager';

export async function applyAttachBackground(
    screenId: number,
    filePath: string,
    id: string | number,
) {
    const droppedData =
        (await attachBackgroundManager.getAttachedBackground(filePath, id)) ??
        (await attachBackgroundManager.getAttachedBackground(filePath));
    if (droppedData === null) {
        return;
    }
    const screenBackgroundManager =
        ScreenBackgroundManager.getInstance(screenId);
    screenBackgroundManager.receiveScreenDropped(droppedData);
}
