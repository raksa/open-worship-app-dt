import { dirSourceSettingNames } from '../helper/constants';
import DirSource from '../helper/DirSource';

export async function getBackgroundSelectedDirSource(type: 'image' | 'video') {
    let dirSource: DirSource | null = null;
    if (type === 'image') {
        dirSource = await DirSource.getInstance(
            dirSourceSettingNames.BACKGROUND_IMAGE,
        );
    } else {
        dirSource = await DirSource.getInstance(
            dirSourceSettingNames.BACKGROUND_VIDEO,
        );
    }
    return dirSource;
}
