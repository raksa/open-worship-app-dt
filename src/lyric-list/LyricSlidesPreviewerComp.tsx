import '../app-document-presenter/items/SlidePreviewer.scss';

import { useState } from 'react';

import { useSelectedLyricContext } from './lyricHelpers';
import { useFileSourceEvents } from '../helper/dirSourceHelpers';
import { VaryAppDocumentContext } from '../app-document-list/appDocumentHelpers';
import VaryAppDocumentItemsPreviewerComp from '../app-document-presenter/items/VaryAppDocumentItemsPreviewerComp';
import AppDocument from '../app-document-list/AppDocument';
import Lyric from './Lyric';
import Slide from '../app-document-list/Slide';
import { getDefaultScreenDisplay } from '../_screen/managers/screenHelpers';
import AppDocumentPreviewerFooterComp from '../app-document-presenter/items/AppDocumentPreviewerFooterComp';
import { MimetypeNameType } from '../server/fileHelpers';

class LyricSlide extends Slide {}

// FIXME: drag and drop on mini screen does not work
class LyricAppDocument extends AppDocument {
    static readonly mimetypeName: MimetypeNameType = 'lyric';
    isEditable = false;
    lyric: Lyric;

    constructor(lyric: Lyric) {
        super(lyric.filePath);
        this.lyric = lyric;
    }

    async getSlides() {
        const display = getDefaultScreenDisplay();
        return [
            new LyricSlide(this.filePath, {
                id: 0,
                canvasItems: [],
                metadata: {
                    width: display.bounds.width,
                    height: display.bounds.height,
                },
            }),
        ];
    }

    async save(): Promise<boolean> {
        throw new Error('LyricAppDocument does not support saving slides.');
    }
}

export default function LyricSlidesPreviewerComp() {
    const selectedLyric = useSelectedLyricContext();
    const [appDocument, setAppDocument] = useState<LyricAppDocument>(
        () => new LyricAppDocument(selectedLyric),
    );
    useFileSourceEvents(
        ['update'],
        async () => {
            setAppDocument(new LyricAppDocument(selectedLyric));
        },
        [],
        selectedLyric.filePath,
    );
    console.log(appDocument.getItemById);
    
    return (
        <div className="card w-100 h-100 p-1">
            <VaryAppDocumentContext value={appDocument}>
                <div className="card-body w-100 h-100 overflow-hidden">
                    <div className="slide-previewer card w-100 h-100">
                        <VaryAppDocumentItemsPreviewerComp />
                    </div>
                    <AppDocumentPreviewerFooterComp />
                </div>
            </VaryAppDocumentContext>
        </div>
    );
}
