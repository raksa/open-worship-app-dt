import './PathSelectorComp.scss';

import { lazy } from 'react';

import { useStateSettingBoolean } from '../helper/settingHelpers';
import DirSource from '../helper/DirSource';
import AppSuspenseComp from './AppSuspenseComp';
import { PathPreviewerComp } from './PathPreviewerComp';

const LazyPathEditorComp = lazy(() => {
    return import('./PathEditorComp');
});

export default function PathSelectorComp({
    dirSource,
    prefix,
    addItems,
}: Readonly<{
    dirSource: DirSource;
    prefix: string;
    addItems?: () => void;
}>) {
    const [showing, setShowing] = useStateSettingBoolean(
        `${prefix}-selector-opened`,
        false,
    );
    const dirPath = dirSource.dirPath;
    const isShowingEditor = !dirPath || showing;
    return (
        <div className="path-selector w-100">
            <div
                className="d-flex path-previewer pointer"
                title={(isShowingEditor ? 'Hide' : 'Show') + ' path editor'}
                onClick={() => {
                    setShowing(!showing);
                }}
            >
                <i
                    className={`bi ${
                        isShowingEditor ? 'bi-chevron-down' : 'bi-chevron-right'
                    }`}
                />
                {!isShowingEditor && (
                    <RenderTitle dirSource={dirSource} addItems={addItems} />
                )}
            </div>
            {isShowingEditor && (
                <AppSuspenseComp>
                    <LazyPathEditorComp dirSource={dirSource} prefix={prefix} />
                </AppSuspenseComp>
            )}
        </div>
    );
}

function RenderTitle({
    dirSource,
    addItems,
}: Readonly<{
    dirSource: DirSource;
    addItems?: () => void;
}>) {
    if (!dirSource.dirPath) {
        return null;
    }
    return (
        <>
            <PathPreviewerComp dirPath={dirSource.dirPath} />
            <div
                className="ps-2"
                title="Reload"
                onClick={(event) => {
                    event.stopPropagation();
                    dirSource.fireReloadEvent();
                }}
            >
                <i className="bi bi-arrow-clockwise" />
            </div>
            {addItems !== undefined ? (
                <div
                    className="app-add-items-button px-1"
                    title="Add items"
                    onClick={(event) => {
                        event.stopPropagation();
                        addItems();
                    }}
                >
                    <i className="bi bi-plus-lg" />
                </div>
            ) : null}
        </>
    );
}
