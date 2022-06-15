import './LyricList.scss';

import { useState } from 'react';
import {
    getSetting, setSetting, useStateSettingString,
} from '../helper/settingHelper';
import { showAppContextMenu } from '../others/AppContextMenu';
import { toastEventListener } from '../event/ToastEventListener';
import {
    fullTextPresentEventListener,
    useLyricUpdating,
} from '../event/FullTextPresentEventListener';
import LyricItem, { presentLyric } from './LyricItem';
import FileListHandler, { createNewItem } from '../others/FileListHandler';
import { FileSource } from '../helper/fileHelper';
import { LyricType, validateLyric } from '../helper/lyricHelpers';

export function clearLyricListEditingIndex() {
    setSetting('lyric-list-editing-index', '-1');
}
export function getLyricListEditingIndex() {
    const index = +getSetting('lyric-list-editing-index', '-1');
    if (!isNaN(index) && ~index) {
        return index;
    }
    return null;
}
export function getDefaultLyricList() {
    let defaultLyricList = [];
    try {
        const str = getSetting('lyric-list');
        defaultLyricList = JSON.parse(str);
    } catch (error) { }
    return defaultLyricList;
}

export function getDefaultLyricItem(): LyricType | null {
    const index = getLyricListEditingIndex();
    const list = getDefaultLyricList();
    if (index !== null && list[index]) {
        return list[index];
    }
    return null;
}

function toNewLyric(name: string) {
    return {
        title: name,
        text: `
Block1
===
Block2
===
Block3
` };
}
const id = 'lyric-list';
export default function LyricList() {
    const [list, setList] = useState<FileSource[] | null>(null);
    const [dir, setDir] = useStateSettingString(`${id}-selected-dir`, '');
    useLyricUpdating((lyricPresents) => {
        const lyric = getDefaultLyricItem();
        if (list !== null && lyric !== null) {
            lyric.items = lyricPresents;
            const fileSource = list.find((fs) => {
                return fs.fileName === lyric.fileName;
            });
            fileSource?.saveData(lyric).then(() => {
                setList(null);
            });
        }
    });
    const openItemContextMenu = (fileSource: FileSource, index: number) => {
        return (e: any) => {
            showAppContextMenu(e, [
                {
                    title: 'Open', onClick: async () => {
                        const lyric = await fileSource.readFileToData<LyricType>(validateLyric);
                        if (lyric !== null) {
                            presentLyric(lyric, index);
                        } else {
                            toastEventListener.showSimpleToast({
                                title: 'Opening Lyric',
                                message: 'Unable to open lyric',
                            });
                        }
                    },
                },
                {
                    title: 'Delete', onClick: () => {
                        const newList = (list || []).filter((_, i1) => i1 !== index);
                        // TODO: fix deleting
                        setList(newList);
                        if (getLyricListEditingIndex() === index) {
                            clearLyricListEditingIndex();
                            fullTextPresentEventListener.presentLyric([]);
                        }
                    },
                },
            ]);
        };
    };
    return (
        <FileListHandler id={id} mimetype={'lyric'}
            list={list} setList={setList}
            dir={dir} setDir={setDir}
            onNewFile={async (name) => {
                if (name !== null) {
                    const content = JSON.stringify({
                        metadata: {
                            fileVersion: 1,
                            app: 'OpenWorship',
                            initDate: (new Date()).toJSON(),
                        },
                        items: [toNewLyric(name)],
                    });
                    const isSuccess = await createNewItem(dir, name, content);
                    if (isSuccess) {
                        setList(null);
                        return false;
                    }
                }
                return true;
            }}
            contextMenu={[{
                title: 'Test', onClick: () => {
                    console.log('test');
                },
            }]}
            header={<span>Lyrics</span>}
            body={<>
                {(list || []).map((fileSource, i) => {
                    return <LyricItem key={`${i}`}
                        index={i}
                        fileSource={fileSource}
                        onDragOnIndex={async (dropIndex: number) => {
                            const newList = [...(list || [])];
                            const target = newList.splice(dropIndex, 1)[0];
                            newList.splice(i, 0, target);
                            // TODO: fixed order then save to files
                            setList(newList);
                        }}
                        onContextMenu={openItemContextMenu(fileSource, i)} />;
                })}
            </>} />
    );
}
