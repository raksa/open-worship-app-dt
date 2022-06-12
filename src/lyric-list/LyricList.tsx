import './LyricList.scss';

import { useState } from 'react';
import { getSetting, setSetting } from '../helper/settingHelper';
import { showAppContextMenu } from '../others/AppContextMenu';
import { toastEventListener } from '../event/ToastEventListener';
import {
    fullTextPresentEventListener,
    useLyricUpdating,
} from '../event/FullTextPresentEventListener';
import LyricItem, { presentLyric } from './LyricItem';
import { AskingNewName } from '../others/AskingNewName';

export type LyricPresentType = {
    title: string,
    text: string,
};
type LyricItemType = {
    fileName: string,
    items: LyricPresentType[],
};

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

export function getDefaultLyricItem(): LyricItemType | null {
    const index = getLyricListEditingIndex();
    const list = getDefaultLyricList();
    if (index !== null && list[index]) {
        return list[index];
    }
    return null;
}

export default function LyricList() {
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [list, setList] = useState<LyricItemType[]>(getDefaultLyricList());
    const applyList = (newList: LyricItemType[]) => {
        setList(newList);
        setSetting('lyric-list', JSON.stringify(newList));
    };
    const createNewLyric = (name: string) => {
        const isExist = list.some((l) => l.fileName === name);
        if (isExist) {
            toastEventListener.showSimpleToast({
                title: 'Creating Lyric',
                message: 'Lyric with file name already exist!',
            });
            return;
        }
        const newList = [...list, {
            fileName: name,
            items: [{
                title: name, text: `
Block1
===
Block2
===
Block3
` }],
        }];
        applyList(newList);
        setIsCreatingNew(false);
    };
    useLyricUpdating((lyricPresents) => {
        const lyric = getDefaultLyricItem();
        if (lyric !== null) {
            lyric.items = lyricPresents;
            const newList = list.map((l) => {
                if (l.fileName === lyric.fileName) {
                    return lyric;
                } else {
                    return l;
                }
            });
            applyList(newList);
        }
    });
    return (
        <div id="lyric-list" className="card w-100 h-100">
            <div className="card-header">
                <span>Lyrics</span>
                <button className="btn btn-sm btn-outline-info float-end" title="new slide list"
                    onClick={() => setIsCreatingNew(true)}>
                    <i className="bi bi-file-earmark-plus" />
                </button>
            </div>
            <div className="card-body pb-5" onContextMenu={(e) => {
                showAppContextMenu(e, [
                    {
                        title: 'Delete All', onClick: () => {
                            applyList([]);
                        },
                    },
                ]);
            }}>
                <ul className="list-group">
                    {isCreatingNew && <AskingNewName applyName={(name) => {
                        setIsCreatingNew(false);
                        if (name !== null) {
                            createNewLyric(name);
                        }
                    }} />}
                    {list.map((item, i) => {
                        return <LyricItem key={`${i}`}
                            index={i}
                            lyricItem={item}
                            rename={(newName) => {
                                const newList = [...list];
                                newList[i].fileName = newName;
                                applyList(newList);
                            }}
                            onDragOnIndex={(dropIndex: number) => {
                                const newList = [...list];
                                const target = newList.splice(dropIndex, 1)[0];
                                newList.splice(i, 0, target);
                                applyList(newList);
                            }}
                            onContextMenu={(e, callback) => {
                                showAppContextMenu(e, [
                                    {
                                        title: 'Open', onClick: () => {
                                            if (list[i]) {
                                                presentLyric(list[i], i);
                                            }
                                        },
                                    },
                                    {
                                        title: 'Rename', onClick: () => {
                                            callback('rename');
                                        },
                                    },
                                    {
                                        title: 'Delete', onClick: () => {
                                            if (list[i]) {
                                                const newList = list.filter((_, i1) => i1 !== i);
                                                applyList(newList);
                                                if (getLyricListEditingIndex() === i) {
                                                    clearLyricListEditingIndex();
                                                    fullTextPresentEventListener.presentLyric([]);
                                                }
                                            }
                                        },
                                    },
                                ]);
                            }} />;
                    })}
                </ul>
            </div>
        </div>
    );
}
