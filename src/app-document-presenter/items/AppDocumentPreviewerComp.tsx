import './SlidePreviewer.scss';

import { use } from 'react';

import VaryAppDocumentItemsPreviewerComp from './VaryAppDocumentItemsPreviewerComp';
import AppDocumentPreviewerFooterComp from './AppDocumentPreviewerFooterComp';
import { SelectedVaryAppDocumentContext } from '../../app-document-list/appDocumentHelpers';

export default function AppDocumentPreviewerComp() {
    const selectedAppDocumentContext = use(SelectedVaryAppDocumentContext);
    if (!selectedAppDocumentContext?.selectedVaryAppDocument) {
        return (
            <div className="w-100 h-100 d-flex justify-content-center align-items-center">
                <h3 className="text-muted">`No Lyric Selected</h3>
            </div>
        );
    }
    return (
        <div id="slide-previewer" className="card w-100 h-100">
            <div className="card-body w-100 h-100 overflow-hidden">
                <VaryAppDocumentItemsPreviewerComp />
            </div>
            <AppDocumentPreviewerFooterComp />
        </div>
    );
}
