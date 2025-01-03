import { useState } from 'react';

import LoadingComp from '../../others/LoadingComp';
import {
    handBibleInfoContextMenuOpening, bibleKeyToFilePath,
    handBibleKeyContextMenuOpening, updateBibleXMLInfo,
    useBibleXMLInfo,
} from './bibleXMLHelpers';
import { fsDeleteFile } from '../../server/fileHelpers';
import { showAppConfirm } from '../../popup-widget/popupWidgetHelpers';

function PreviewBibleXMLInfoComp({ bibleKey, loadBibleKeys }: Readonly<{
    bibleKey: string,
    loadBibleKeys: () => void,
}>) {
    const { bibleInfo, setBibleInfo, isPending } = useBibleXMLInfo(bibleKey);
    if (isPending) {
        return (
            <LoadingComp />
        );
    }
    if (bibleInfo === null) {
        return null;
    }
    return (
        <div className='app-border-white-round p-2' style={{
            maxHeight: '300px',
            overflowY: 'auto',
        }}
            onContextMenu={(event) => {
                handBibleInfoContextMenuOpening(
                    event, bibleInfo, (newOutputJson) => {
                        setBibleInfo(newOutputJson);
                    },
                );
            }}>
            <button className='btn btn-success'
                onClick={() => {
                    updateBibleXMLInfo(bibleInfo);
                    loadBibleKeys();
                }}>
                Save
            </button>
            <pre>{JSON.stringify(bibleInfo, null, 2)}</pre>
        </div>
    );
}

function BibleXMLInfoComp({ bibleKey, loadBibleKeys }: Readonly<{
    bibleKey: string,
    loadBibleKeys: () => void,
}>) {
    const [isShowing, setIsShowing] = useState(false);
    const handleFileDeleting = async (event: any) => {
        event.stopPropagation();
        const isConfirmed = await showAppConfirm(
            'Delete Bible XML',
            `Are you sure to delete bible XML "${bibleKey}"?`,
        );
        if (!isConfirmed) {
            return;
        }
        const filePath = await bibleKeyToFilePath(bibleKey);
        await fsDeleteFile(filePath);
        loadBibleKeys();
    };
    return (
        <li className='list-group-item pointer'
            onClick={() => {
                setIsShowing(!isShowing);
            }}
            onContextMenu={handBibleKeyContextMenuOpening.bind(null, bibleKey)}>
            <div>
                <span>{bibleKey}</span>
                <div className='float-end'>
                    <div className='btn-group'>
                        <button className='btn btn-danger'
                            onClick={handleFileDeleting}>
                            Delete
                        </button>
                    </div>
                </div>
            </div>
            {isShowing ? (
                <PreviewBibleXMLInfoComp bibleKey={bibleKey}
                    loadBibleKeys={loadBibleKeys}
                />
            ) : null}
        </li>
    );
}

export default function BibleXMLListComp({
    isPending, bibleKeys, loadBibleKeys,
}: Readonly<{
    isPending: boolean,
    bibleKeys: string[] | null,
    loadBibleKeys: () => void,
}>) {
    if (isPending) {
        return (
            <LoadingComp />
        );
    }
    const buttons = (
        <>
            <button
                title='Refresh'
                className='btn btn-info'
                onClick={() => {
                    loadBibleKeys();
                }}>
                <i className='bi bi-arrow-clockwise' /> Refresh
            </button>
            <a className='btn btn-secondary ms-2' href={
                'https://www.google.com/search?q=holy+bible+xml+format'
            } target='_blank'>
                Search XML
            </a>
        </>
    );
    if (bibleKeys === null || bibleKeys.length === 0) {
        return (
            <div>
                No Bible XML files {buttons}
            </div>
        );
    }
    return (
        <>
            <h3>
                Bibles XML {buttons}
            </h3>
            <div className='w-100 app-border-white-round p-2'>
                <ul className='list-group d-flex flex-fill'>
                    {bibleKeys.map((bibleKey) => {
                        return (
                            <BibleXMLInfoComp key={bibleKey}
                                bibleKey={bibleKey}
                                loadBibleKeys={loadBibleKeys}
                            />
                        );
                    })}
                </ul>
            </div>
        </>
    );
}
