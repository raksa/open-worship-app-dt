import './PathSelector.scss';

import { useStateSettingBoolean } from '../helper/settingHelper';
import DirSource from '../helper/DirSource';
import React from 'react';
import AppSuspense from './AppSuspense';
import { useDSEvents } from '../helper/dirSourceHelpers';
import { pathPreviewer } from './PathPreviewer';

const PathPreviewer = React.lazy(() => {
    return import('./PathEditor');
});

export default function PathSelector({
    dirSource, prefix,
}: {
    dirSource: DirSource,
    prefix: string
}) {
    const [showing, setShowing] = useStateSettingBoolean(
        `${prefix}-selector-opened`, false);
    const dirPath = dirSource.dirPath;
    const isShowingEditor = !dirPath || showing;
    return (
        <div className='path-selector w-100'>
            <div className='d-flex path-previewer pointer'
                onClick={() => {
                    setShowing(!showing);
                }}>
                <i className={`bi ${isShowingEditor ?
                    'bi-chevron-down' : 'bi-chevron-right'}`} />
                {!isShowingEditor && <RenderTitle dirSource={dirSource} />}
            </div>
            {isShowingEditor && <AppSuspense>
                <PathPreviewer
                    dirSource={dirSource}
                    prefix={prefix} />
            </AppSuspense>}
        </div>
    );
}

function RenderTitle({ dirSource }: { dirSource: DirSource }) {
    if (!dirSource.dirPath) {
        return null;
    }
    return (
        <>
            {pathPreviewer(dirSource.dirPath)}
            <div className='px-2'
                onClick={(event) => {
                    event.stopPropagation();
                    dirSource.fireReloadEvent();
                }}>
                <i className='bi bi-arrow-clockwise' />
            </div>
        </>
    );
}
