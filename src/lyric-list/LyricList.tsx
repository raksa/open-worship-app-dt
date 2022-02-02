import './LyricList.scss';

import { useState } from 'react';
import { getSetting, setSetting } from '../helper/settings';
import { showAppContextMenu } from '../helper/AppContextMenu';
import { lyricListEventListener, useLyricUpdating } from '../event/LyricListEventListener';
import { toastEventListener } from '../event/ToastEventListener';

export type LyricPresentType = {
    title: string,
    text: string,
};
type LyricItemType = {
    fileName: string,
    items: LyricPresentType[],
};
const presentLyric = (lyricItem: LyricItemType, index: number) => {
    // TODO: change to fileName
    setSetting('lyric-list-editing-index', `${index}`);
    lyricListEventListener.present(lyricItem.items);
}

function LyricItem({ index, lyricItem, onContextMenu }: {
    index: number,
    lyricItem: LyricItemType,
    onContextMenu?: (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => void,
}) {
    return (
        <li className="list-group-item item"
            draggable
            onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", JSON.stringify(lyricItem));
            }}
            onContextMenu={onContextMenu ? onContextMenu : () => { }}
            onClick={() => presentLyric(lyricItem, index)}>
            <i className="bi bi-bookmark" />
            {lyricItem.fileName}
        </li>
    );
}

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
    const [creatingNewFileName, setCreatingNewFileName] = useState('');
    const [list, setList] = useState<LyricItemType[]>(getDefaultLyricList());
    const applyList = (newList: LyricItemType[]) => {
        setList(newList);
        setSetting('lyric-list', JSON.stringify(newList));
    };
    const creatNewLyric = () => {
        const isExist = list.some((l) => l.fileName === creatingNewFileName);
        if (isExist) {
            toastEventListener.showSimpleToast({
                title: 'Creating Lyric',
                message: 'Lyric with file name already exist!'
            })
            return;
        }
        let newList = [...list, {
            fileName: creatingNewFileName,
            items: [{
                title: creatingNewFileName, text: `
Block1
===
Block2
===
Block3
` }],
        }];
        applyList(newList);
        setCreatingNewFileName('');
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
                <span>Lyric List</span>
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
                        }
                    },
                ]);
            }}>
                <ul className="list-group">
                    {isCreatingNew && <li className='list-group-item'>
                        <div className="input-group">
                            <input type="text" className="form-control" placeholder="title"
                                value={creatingNewFileName}
                                aria-label="file name" aria-describedby="button-addon2" autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        creatNewLyric();
                                    } else if (e.key === 'Escape') {
                                        setIsCreatingNew(false);
                                    }
                                }}
                                onChange={(e) => {
                                    // TODO: validate file name
                                    setCreatingNewFileName(e.target.value);
                                }} />
                            <button className="btn btn-outline-success" type="button" id="button-addon2"
                                onClick={creatNewLyric}>
                                <i className="bi bi-plus" />
                            </button>
                        </div>
                    </li>}
                    {list.map((item, i) => {
                        return <LyricItem key={`${i}`} index={i} lyricItem={item} onContextMenu={(e) => {
                            showAppContextMenu(e, [
                                {
                                    title: 'Open', onClick: () => {
                                        if (list[i]) {
                                            presentLyric(list[i], i);
                                        }
                                    }
                                },
                                {
                                    title: 'Delete', onClick: () => {
                                        if (list[i]) {
                                            const newList = list.filter((_, i1) => i1 !== i);
                                            applyList(newList);
                                            if (getLyricListEditingIndex() === i) {
                                                clearLyricListEditingIndex();
                                                lyricListEventListener.present([]);
                                            }
                                        }
                                    }
                                },
                            ]);
                        }} />
                    })}
                </ul>
            </div>
        </div>
    );
}
