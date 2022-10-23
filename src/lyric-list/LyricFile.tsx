import { useEffect, useState } from 'react';
import Lyric from './Lyric';
import FileItemHandler from '../others/FileItemHandler';
import FileSource from '../helper/FileSource';
import ItemColorNote from '../others/ItemColorNote';
import ItemSource from '../helper/ItemSource';
import { getIsPreviewingLyric } from '../full-text-present/FullTextPreviewer';
import { previewingEventListener } from '../event/PreviewingEventListener';
import { useFSEvents } from '../helper/dirSourceHelpers';

export default function LyricFile({
    index, fileSource,
}: {
    index: number,
    fileSource: FileSource,
}) {
    const [data, setData] = useState<Lyric | null | undefined>(null);
    useEffect(() => {
        if (data === null) {
            Lyric.readFileToData(fileSource).then(setData);
        }
    }, [data]);
    useFSEvents(['update', 'history-update', 'edit'],
        fileSource, () => {
            setData(null);
        });
    return (
        <FileItemHandler
            index={index}
            data={data}
            reload={() => {
                setData(null);
            }}
            fileSource={fileSource}
            isPointer
            onClick={() => {
                if (data) {
                    if (data.isSelected && !getIsPreviewingLyric()) {
                        previewingEventListener.selectLyric(data);
                        return;
                    }
                    data.isSelected = !data.isSelected;
                }
            }}
            renderChild={(lyric) => {
                return (
                    <LyricFilePreview lyric={lyric as Lyric} />
                );
            }}
        />
    );
}

function LyricFilePreview({ lyric }: { lyric: Lyric }) {
    return (
        <>
            <i className='bi bi-music-note' />
            {lyric.fileSource.name}
            {lyric.isChanged && <span
                style={{ color: 'red' }}>*</span>}
            <ItemColorNote item={lyric as ItemSource<any>} />
        </>
    );
}
