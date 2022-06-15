import { useEffect } from 'react';
import PathSelector from '../others/PathSelector';
import { toastEventListener } from '../event/ToastEventListener';
import fileHelpers, {
    FileSourceType,
    getAppMimetype,
    MimetypeNameType,
} from '../helper/fileHelper';

export const createNewItem = async (dir: string, name: string, content: string) => {
    // TODO: verify file name before create
    const mimeTypes = getAppMimetype('playlist');
    const playlistName = `${name}${mimeTypes[0].extension[0]}`;
    try {
        await fileHelpers.createFile(content, dir, playlistName);
        return true;
    } catch (error: any) {
        toastEventListener.showSimpleToast({
            title: 'Creating Playlist',
            message: error.message,
        });
    }
    return false;
};
export default function FileListHandler({
    id, mimetype, list, setList, dir, setDir, ...children
}: {
    id: string, mimetype: MimetypeNameType,
    list: FileSourceType[] | null,
    setList: (l: FileSourceType[] | null) => void,
    dir: string, setDir: (d: string) => void,
    header: any, body: any,
}) {
    useEffect(() => {
        if (list === null) {
            fileHelpers.listFiles(dir, mimetype).then((newList) => {
                setList(newList === null ? [] : newList);
            }).catch((error: any) => {
                toastEventListener.showSimpleToast({
                    title: 'Listing',
                    message: error.message,
                });
            });
        }
    }, [list, dir]);

    const applyDir = (newDir: string) => {
        setDir(newDir);
        setList(null);
    };
    return (
        <div id={id} className="card w-100 h-100">
            <div className="card-header">
                {children.header}
            </div>
            <div className="card-body">
                <PathSelector
                    prefix={`bg-${id}`}
                    dirPath={dir}
                    onRefresh={() => setList(null)}
                    onChangeDirPath={applyDir}
                    onSelectDirPath={applyDir} />
                {children.body}
            </div>
        </div>
    );
}
