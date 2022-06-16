import './SlideList.scss';

import { useRef, useState } from 'react';
import PathSelector from '../others/PathSelector';
import { useStateSettingString } from '../helper/settingHelper';
import {
    useRefreshing, useSlideItemThumbSelecting,
} from '../event/SlideListEventListener';
import { usePresentFGClearing } from '../event/PresentEventListener';
import SlideListView from './SlideListView';

export default function SlideList() {
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [basePath, setNewBasePath] = useStateSettingString('slide-selected-dir', '');
    const slideListView = useRef<SlideListView>(null);
    const refresh = () => {
        slideListView.current?.refresh();
    };
    useRefreshing(refresh);
    useSlideItemThumbSelecting(refresh);
    usePresentFGClearing(refresh);
    return (
        <div id="slide-list" className="card w-100 h-100">
            <div className="card-header">
                <span>Slides</span>
                <button className="btn btn-sm btn-outline-info float-end" title="new slide list"
                    onClick={() => setIsCreatingNew(true)}>
                    <i className="bi bi-file-earmark-plus" />
                </button>
            </div>
            <div className="card-body">
                <PathSelector
                    prefix='bg-slide-list'
                    dirPath={basePath}
                    onRefresh={refresh}
                    onChangeDirPath={(newBasePath) => {
                        setNewBasePath(newBasePath);
                        refresh();
                    }}
                    onSelectDirPath={(newBasePath) => {
                        setNewBasePath(newBasePath);
                        refresh();
                    }} />
                <SlideListView
                    ref={slideListView}
                    baseDir={basePath}
                    isCreatingNew={isCreatingNew}
                    setIsCreatingNew={setIsCreatingNew} />
            </div>
        </div>
    );
}
