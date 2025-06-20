import PathSelectorComp from '../../others/PathSelectorComp';
import { useAppStateAsync } from '../../helper/debuggerHelpers';
import { dirSourceSettingNames } from '../../helper/constants';
import DirSource from '../../helper/DirSource';
import { SELECTED_PARENT_DIR_SETTING_NAME } from './directoryHelpers';

function RenderPathElementComp({
    title,
    settingName,
}: Readonly<{
    title: string;
    settingName: string;
}>) {
    const [dirSource] = useAppStateAsync(() => {
        return DirSource.getInstance(settingName);
    });
    if (!dirSource) {
        return null;
    }
    return (
        <div className="d-flex m-3">
            <div>{title}:</div>
            <div>
                <PathSelectorComp
                    prefix={`path-${settingName}`}
                    dirSource={dirSource}
                />
            </div>
        </div>
    );
}

function RenderParentDirectoryComp() {
    const [dirSource] = useAppStateAsync(() => {
        return DirSource.getInstance(SELECTED_PARENT_DIR_SETTING_NAME);
    });
    if (!dirSource) {
        return null;
    }
    return (
        <div className="d-flex m-3">
            <div>Parent Directory:</div>
            <div>
                <PathSelectorComp
                    prefix="path-parent-dir"
                    dirSource={dirSource}
                />
            </div>
        </div>
    );
}

const titleSettingNames = {
    Documents: dirSourceSettingNames.DOCUMENT,
    Lyrics: dirSourceSettingNames.LYRIC,
    Playlists: dirSourceSettingNames.PLAYLIST,
    'Background Images': dirSourceSettingNames.BACKGROUND_IMAGE,
    'Background Videos': dirSourceSettingNames.BACKGROUND_VIDEO,
    'Background Sounds': dirSourceSettingNames.BACKGROUND_SOUND,
    'Bible Present': dirSourceSettingNames.BIBLE_PRESENT,
    'Bible Reader': dirSourceSettingNames.BIBLE_READ,
};
export default function SettingGeneralPathComp() {
    return (
        <div className="card">
            <div className="card-header">Path Settings</div>
            <div className="card-body">
                <RenderParentDirectoryComp />
                <hr />
                {Object.entries(titleSettingNames).map(
                    ([title, settingName]) => {
                        return (
                            <RenderPathElementComp
                                key={title}
                                title={title}
                                settingName={settingName}
                            />
                        );
                    },
                )}
            </div>
        </div>
    );
}
