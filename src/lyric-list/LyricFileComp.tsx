import { use, useState } from 'react';

import Lyric from './Lyric';
import FileItemHandlerComp from '../others/FileItemHandlerComp';
import FileSource from '../helper/FileSource';
import AppDocumentSourceAbs from '../helper/DocumentSourceAbs';
import { previewingEventListener } from '../event/PreviewingEventListener';
import { useFileSourceEvents } from '../helper/dirSourceHelpers';
import { useAppEffect } from '../helper/debuggerHelpers';
import {
    SelectedLyricContext,
    useSelectedLyricSetterContext,
} from './lyricHelpers';
import { getIsShowingLyricPreviewer } from '../app-document-presenter/PresenterComp';

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

export default function LyricFileComp({
    index,
    filePath,
}: Readonly<{
    index: number;
    filePath: string;
}>) {
    const selectedContext = use(SelectedLyricContext);
    const isSelected =
        selectedContext !== null &&
        selectedContext.selectedLyric?.filePath === filePath;
    const setSelectedLyric = useSelectedLyricSetterContext();
    const [lyric, setLyric] = useState<Lyric | null | undefined>(null);
    useAppEffect(() => {
        if (lyric === null) {
            const data = Lyric.getInstance(filePath);
            setLyric(data);
        }
    }, [lyric]);
    useFileSourceEvents(
        ['update'],
        () => {
            setLyric(null);
        },
        [lyric],
        filePath,
    );
    const handleReloading = () => {
        setLyric(null);
    };
    const handleClicking = () => {
        if (!lyric) {
            return;
        }
        if (selectedContext && !getIsShowingLyricPreviewer()) {
            previewingEventListener.showLyric(lyric);
            return;
        }
        setSelectedLyric(lyric);
    };
    const handleChildRendering = (lyric: AppDocumentSourceAbs) => {
        return <LyricFilePreview lyric={lyric as Lyric} />;
    };
    return (
        <FileItemHandlerComp
            index={index}
            data={lyric}
            reload={handleReloading}
            filePath={filePath}
            isPointer
            onClick={handleClicking}
            renderChild={handleChildRendering}
            isSelected={isSelected}
        />
    );
}
