import { useCallback, useState } from 'react';
import Lyric from './Lyric';
import FileItemHandler from '../others/FileItemHandler';
import FileSource from '../helper/FileSource';
import ItemSource from '../helper/ItemSource';
import { getIsPreviewingLyric } from '../full-text-present/FullTextPreviewer';
import { previewingEventListener } from '../event/PreviewingEventListener';
import { useFSEvents } from '../helper/dirSourceHelpers';
import { useAppEffect } from '../helper/debuggerHelpers';

export default function LyricFile({
    index, fileSource,
}: {
    index: number,
    fileSource: FileSource,
}) {
    const [data, setData] = useState<Lyric | null | undefined>(null);
    const reloadCallback = useCallback(() => {
        setData(null);
    }, [setData]);
    const onClickCallback = useCallback(() => {
        if (data) {
            if (data.isSelected && !getIsPreviewingLyric()) {
                previewingEventListener.selectLyric(data);
                return;
            }
            data.isSelected = !data.isSelected;
        }
    }, [data]);
    const renderChildCallback = useCallback((lyric: ItemSource<any>) => {
        return (
            <LyricFilePreview lyric={lyric as Lyric} />
        );
    }, []);
    useAppEffect(() => {
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
            reload={reloadCallback}
            fileSource={fileSource}
            isPointer
            onClick={onClickCallback}
            renderChild={renderChildCallback}
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
        </>
    );
}
