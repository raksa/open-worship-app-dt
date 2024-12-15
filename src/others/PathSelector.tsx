import './PathSelector.scss';

import { lazy } from 'react';

import { useStateSettingBoolean } from '../helper/settingHelpers';
import DirSource from '../helper/DirSource';
import AppSuspense from './AppSuspense';
import { PathPreviewer } from './PathPreviewer';

const LazyPathEditor = lazy(() => {
    return import('./PathEditor');
});

export default function PathSelector({
    dirSource, prefix, addItems,
}: Readonly<{
    dirSource: DirSource,
    prefix: string,
    addItems?: () => void,
}>) {
    const [showing, setShowing] = useStateSettingBoolean(
        `${prefix}-selector-opened`, false,
    );
    const dirPath = dirSource.dirPath;
    const isShowingEditor = !dirPath || showing;
    return (
        <div className='path-selector w-100'>
            <div className='d-flex path-previewer pointer'
                onClick={() => {
                    setShowing(!showing);
                }}>
                <i className={
                    `bi ${isShowingEditor ?
                        'bi-chevron-down' : 'bi-chevron-right'}`
                }
                />
                {!isShowingEditor && (
                    <RenderTitle dirSource={dirSource} addItems={addItems} />
                )}
            </div>
            {isShowingEditor && (
                <AppSuspense>
                    <LazyPathEditor dirSource={dirSource} prefix={prefix} />
                </AppSuspense>
            )}
        </div>
    );
}

function RenderTitle({ dirSource, addItems }: Readonly<{
    dirSource: DirSource,
    addItems?: () => void,
}>) {
    if (!dirSource.dirPath) {
        return null;
    }
    return (
        <>
            <PathPreviewer dirPath={dirSource.dirPath} />
            <div className='ps-2'
                onClick={(event) => {
                    event.stopPropagation();
                    dirSource.fireReloadEvent();
                }}>
                <i className='bi bi-arrow-clockwise' />
            </div>
            {addItems !== undefined ? (
                <div className='px-1'
                    onClick={(event) => {
                        event.stopPropagation();
                        addItems();
                    }}>
                    <i className='bi bi-plus-lg' />
                </div>
            ) : null}
        </>
    );
}
