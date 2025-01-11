import { useState } from 'react';

import Lyric from './Lyric';
import FileItemHandlerComp from '../others/FileItemHandlerComp';
import FileSource from '../helper/FileSource';
import AppDocumentSourceAbs from '../helper/DocumentSourceAbs';
import { previewingEventListener } from '../event/PreviewingEventListener';
import { useFileSourceEvents } from '../helper/dirSourceHelpers';
import { useAppEffect } from '../helper/debuggerHelpers';

export default function LyricFile({
    index,
    filePath,
}: Readonly<{
    index: number;
    filePath: string;
}>) {
    const [data, setData] = useState<Lyric | null | undefined>(null);
    const handleReloading = () => {
        setData(null);
    };
    const handleClicking = () => {
        if (data) {
            if (data.isSelected) {
                previewingEventListener.selectLyric(data);
                return;
            }
            data.isSelected = true;
        }
    };
    const handleChildRendering = (lyric: AppDocumentSourceAbs) => {
        return <LyricFilePreview lyric={lyric as Lyric} />;
    };
    useAppEffect(() => {
        if (data === null) {
            // Lyric.readFileToData(filePath).then(setData);
        }
    }, [data]);
    useFileSourceEvents(
        ['update', 'history-update', 'edit'],
        () => {
            setData(null);
        },
        [data],
        filePath,
    );
    return (
        <FileItemHandlerComp
            index={index}
            data={data}
            reload={handleReloading}
            filePath={filePath}
            isPointer
            onClick={handleClicking}
            renderChild={handleChildRendering}
        />
    );
}

function LyricFilePreview({ lyric }: Readonly<{ lyric: Lyric }>) {
    const fileSource = FileSource.getInstance(lyric.filePath);
    return (
        <>
            <i className="bi bi-music-note" />
            {fileSource.name}
            <span style={{ color: 'red' }}>*</span>
        </>
    );
}
