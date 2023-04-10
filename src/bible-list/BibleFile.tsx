import React, { useCallback, useState } from 'react';
import FileItemHandler from '../others/FileItemHandler';
import FileSource from '../helper/FileSource';
import Bible from './Bible';
import AppSuspense from '../others/AppSuspense';
import ItemSource from '../helper/ItemSource';
import { openConfirm } from '../alert/alertHelpers';
import { useAppEffect } from '../helper/debuggerHelpers';
import { moveBibleItemTo } from '../bible-search/bibleHelpers';

const RenderBibleItems = React.lazy(() => {
    return import('./RenderBibleItems');
});

function genContextMenu(data: Bible | null | undefined) {
    if (!data) {
        return [];
    }
    return [{
        title: 'Empty',
        onClick: () => {
            openConfirm(
                'Empty Bible List',
                'Are you sure to empty this bible list?'
            ).then((isOk) => {
                if (!isOk) {
                    return;
                }
                data.empty();
                data.save();
            });
        },
    }, {
        title: 'Move All Items To',
        onClick: (event: any) => {
            moveBibleItemTo(event, data);
        },
    }];
}

export default function BibleFile({
    index, fileSource,
}: {
    index: number,
    fileSource: FileSource,
}) {
    const [data, setData] = useState<Bible | null | undefined>(null);
    useAppEffect(() => {
        if (data === null) {
            Bible.readFileToData(fileSource).then(setData);
        }
    }, [data]);
    const renderChildCallback = useCallback((bible: ItemSource<any>) => {
        return (
            <BiblePreview bible={bible as Bible} />
        );
    }, []);
    const reloadCallback = useCallback(() => {
        setData(null);
    }, [setData]);
    return (
        <FileItemHandler
            index={index}
            data={data}
            reload={reloadCallback}
            fileSource={fileSource}
            className={'bible-file'}
            renderChild={renderChildCallback}
            isDisabledColorNote
            userClassName='p-0'
            contextMenu={genContextMenu(data)}
        />
    );
}

function BiblePreview({ bible }: { bible: Bible }) {
    return (
        <div className='accordion accordion-flush py-1'>
            <div className='accordion-header pointer'
                onClick={() => {
                    bible.setIsOpened(!bible.isOpened);
                }}>
                <i className={`bi ${bible.isOpened ?
                    'bi-chevron-down' : 'bi-chevron-right'}`} />
                <span className='w-100 text-center'>
                    <i className={`bi bi-book${bible.isOpened ?
                        '-fill' : ''} px-1`} />
                    {bible.fileSource.name}
                </span>
            </div>
            <div className={`accordion-collapse collapse ${bible.isOpened ?
                'show' : ''}`}
                style={{
                    overflow: 'auto',
                }}>
                {bible.isOpened && <div className='accordion-body p-0'>
                    <AppSuspense>
                        <RenderBibleItems bible={bible} />
                    </AppSuspense>
                </div>}
            </div>
        </div>
    );
}
