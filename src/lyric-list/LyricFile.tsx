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
    index, filePath,
}: Readonly<{
    index: number,
    filePath: string,
}>) {
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
            Lyric.readFileToData(filePath).then(setData);
        }
    }, [data]);
    useFSEvents(['update', 'history-update', 'edit'], filePath, () => {
        setData(null);
    });
    return (
        <FileItemHandler
            index={index}
            data={data}
            reload={reloadCallback}
            filePath={filePath}
            isPointer
            onClick={onClickCallback}
            renderChild={renderChildCallback}
        />
    );
}

function LyricFilePreview({ lyric }: Readonly<{ lyric: Lyric }>) {
    const fileSource = FileSource.getInstance(lyric.filePath);
    return (
        <>
            <i className='bi bi-music-note' />
            {fileSource.name}
            {lyric.isChanged && <span
                style={{ color: 'red' }}>*</span>}
        </>
    );
}
