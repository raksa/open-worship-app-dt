import { setSetting } from '../helper/settingHelper';
import { fullTextPresentEventListener } from '../event/FullTextPresentEventListener';
import { useState } from 'react';
import { cloneObject, useReadFileToData } from '../helper/helpers';
import { LyricType, validateLyric } from '../helper/lyricHelpers';
import { FileSource } from '../helper/fileHelper';
import FileNotFound from '../others/FileNotFound';


export const presentLyric = (lyricItem: LyricType, index: number) => {
    // TODO: change to fileName
    setSetting('lyric-list-editing-index', `${index}`);
    fullTextPresentEventListener.presentLyric(lyricItem.items);
};

export default function LyricItem({
    index, fileSource, onContextMenu, onDragOnIndex,
}: {
    index: number,
    fileSource: FileSource,
    onContextMenu?: (e: any) => void,
    onDragOnIndex?: (index: number) => void,
}) {
    const data = useReadFileToData<LyricType>(fileSource, validateLyric);
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    if (data === null) {
        return <FileNotFound onContextMenu={onContextMenu} />;
    }
    return (
        <li className={`list-group-item item ${isDraggingOver ? 'drag-receiving' : ''}`}
            data-index={index + 1}
            draggable
            onDragStart={(e) => {
                const newLyric = cloneObject(data);
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
                    const dropLyric = JSON.parse(receivedData) as LyricType;
                    if (onDragOnIndex && dropLyric.index !== undefined) {
                        onDragOnIndex(+dropLyric.index);
                    }
                } catch (error) {
                    console.log(error);
                }
                setIsDraggingOver(false);
            }}
            onContextMenu={onContextMenu}
            onClick={() => presentLyric(data, index)}>
            <i className="bi bi-music-note" />
            {fileSource.fileName}
        </li>
    );
}
