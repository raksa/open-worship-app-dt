import PathSelectorComp from '../../others/PathSelectorComp';
import { useAppEffect, useAppStateAsync } from '../../helper/debuggerHelpers';
import { dirSourceSettingNames } from '../../helper/constants';
import DirSource from '../../helper/DirSource';
import {
    checkShouldSelectChildDir,
    getDefaultDataDir,
    selectPathForChildDir,
    SELECTED_PARENT_DIR_SETTING_NAME,
    setSelectedParentDirectory,
    getSelectedParentDirectory,
} from './directoryHelpers';
import { fsCreateDir } from '../../server/fileHelpers';
import { OptionalPromise } from '../../others/otherHelpers';

class ParentDirSource extends DirSource {
    _dirPath: string;
    setDirPath: (dirPath: string) => OptionalPromise<void> = (
        _dirPath: string,
    ) => {};
    constructor(dirPath: string) {
        super(SELECTED_PARENT_DIR_SETTING_NAME);
        this._dirPath = dirPath;
    }

    get dirPath() {
        return this._dirPath;
    }

    set dirPath(dirPath: string) {
        this.setDirPath(dirPath);
    }
}

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

function RenderParentDirectoryComp({
    dirSource,
}: Readonly<{ dirSource: DirSource }>) {
    const defaultPath = getDefaultDataDir();
    return (
        <div className="d-flex flex-column m-3">
            <div>
                <div>Parent Directory:</div>
                <div>
                    <PathSelectorComp
                        prefix="path-parent-dir"
                        dirSource={dirSource}
                    />
                </div>
            </div>
            {!dirSource.dirPath ? (
                <div>
                    <hr />
                    <button
                        className="btn btn-sm btn-secondary ms-2"
                        onClick={async () => {
                            await fsCreateDir(defaultPath);
                            selectPathForChildDir(defaultPath);
                            dirSource.dirPath = defaultPath;
                        }}
                    >
                        Set Default Data ({defaultPath})
                    </button>
                </div>
            ) : null}
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
function RenderBodyComp({ dirSource }: Readonly<{ dirSource: DirSource }>) {
    useAppEffect(() => {
        if (dirSource.dirPath && checkShouldSelectChildDir()) {
            selectPathForChildDir(dirSource.dirPath);
        }
    }, [dirSource]);
    return (
        <div className="card">
            <div className="card-header">Path Settings</div>
            <div className="card-body">
                <RenderParentDirectoryComp dirSource={dirSource} />
                <hr />
                {dirSource.dirPath
                    ? Object.entries(titleSettingNames).map(
                          ([title, settingName]) => {
                              return (
                                  <RenderPathElementComp
                                      key={title}
                                      title={title}
                                      settingName={settingName}
                                  />
                              );
                          },
                      )
                    : null}
            </div>
        </div>
    );
}

export default function SettingGeneralPathComp() {
    const [dirSource, setDirSource] = useAppStateAsync(async () => {
        const selectedParentDir = await getSelectedParentDirectory();
        const dirSource = new ParentDirSource(selectedParentDir ?? '');
        return dirSource;
    });
    if (!dirSource) {
        return null;
    }
    dirSource.setDirPath = async (dirPath: string) => {
        await setSelectedParentDirectory(dirPath);
        const newDirSource = new ParentDirSource(dirPath);
        setDirSource(newDirSource);
    };
    return <RenderBodyComp dirSource={dirSource} />;
}
