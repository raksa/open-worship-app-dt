import { setSetting } from '../helper/settingHelper';
import { fullTextPresentEventListener } from '../event/FullTextPresentEventListener';
import { useState } from 'react';
import { cloneObject } from '../helper/helpers';

export type LyricPresentType = {
    title: string,
    text: string,
};
type LyricItemType = {
    index?: number,
    fileName: string,
    items: LyricPresentType[],
};
export const presentLyric = (lyricItem: LyricItemType, index: number) => {
    // TODO: change to fileName
    setSetting('lyric-list-editing-index', `${index}`);
    fullTextPresentEventListener.presentLyric(lyricItem.items);
};

export default function LyricItem({ index, lyricItem: lyric, onContextMenu,
    onDragOnIndex, rename }: {
        index: number,
        lyricItem: LyricItemType,
        onContextMenu?: (e: React.MouseEvent<HTMLLIElement, MouseEvent>,
            callback: (command: string) => void) => void,
        onDragOnIndex?: (index: number) => void,
        rename?: (newName: string) => void,
    }) {
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const [isRenaming, setIsRenaming] = useState(false);
    const [renamingValue, setRenamingValue] = useState(lyric.fileName);
    return (
        <li className={`list-group-item item ${isDraggingOver ? 'drag-receiving' : ''}`}
            data-index={index + 1}
            draggable
            onDragStart={(e) => {
                const newLyric = cloneObject(lyric);
                newLyric.index = index;
                e.dataTransfer.setData('text/plain', JSON.stringify(newLyric));
            }}
            onDragOver={(event) => {
                event.preventDefault();
                setIsDraggingOver(true);
            }}
            onDragLeave={(event) => {
                event.preventDefault();
                setIsDraggingOver(false);
            }}
            onDrop={(event) => {
                const receivedData = event.dataTransfer.getData('text');
                try {
                    const dropLyric = JSON.parse(receivedData) as LyricItemType;
                    if (onDragOnIndex && dropLyric.index !== undefined) {
                        onDragOnIndex(+dropLyric.index);
                    }
                } catch (error) {
                    console.log(error);
                }
                setIsDraggingOver(false);
            }}
            onContextMenu={(e) => {
                if (!onContextMenu) {
                    return;
                }
                onContextMenu(e, (command: string) => {
                    if (command === 'rename') {
                        setIsRenaming(true);
                    }
                });
            }}
            onClick={() => presentLyric(lyric, index)}>
            <i className="bi bi-music-note" />
            {isRenaming ?
                <input className='form-control' type="text"
                    value={renamingValue}
                    onChange={(e) => {
                        setRenamingValue(e.target.value);
                    }} onKeyUp={(e) => {
                        if (e.key === 'Enter') {
                            setIsRenaming(false);
                            if (rename) {
                                rename(renamingValue);
                            }
                        }
                    }} />
                : lyric.fileName}
        </li>
    );
}
