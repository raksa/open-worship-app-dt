import React, { useCallback, useState } from 'react';
import FileItemHandler from '../others/FileItemHandler';
import FileSource from '../helper/FileSource';
import Bible from './Bible';
import AppSuspense from '../others/AppSuspense';
import ItemSource from '../helper/ItemSource';
import { openConfirm } from '../alert/alertHelpers';
import { useAppEffect } from '../helper/debuggerHelpers';
import { moveBibleItemTo } from '../helper/bible-helpers/bibleHelpers';
import { copyToClipboard } from '../server/appHelper';
import { useFSEvents } from '../helper/dirSourceHelpers';

const RenderBibleItems = React.lazy(() => {
    return import('./RenderBibleItems');
});

function genContextMenu(bible: Bible | null | undefined) {
    if (!bible) {
        return [];
    }
    return [{
        title: '(*T) ' + 'Empty',
        onClick: () => {
            openConfirm(
                'Empty Bible List',
                'Are you sure to empty this bible list?'
            ).then((isOk) => {
                if (!isOk) {
                    return;
                }
                bible.empty();
                bible.save();
            });
        },
    },
    {
        title: '(*T) ' + 'Copy All Items',
        onClick: async () => {
            const promises = bible.items.map((item) => {
                return item.toTitleText();
            });
            const renderedItems = await Promise.all(promises);
            const text = renderedItems.map(({ title, text }) => {
                return `${title}\n${text}`;
            });
            copyToClipboard(text.join('\n\n'));
        },
    }, {
        title: '(*T) ' + 'Move All Items To',
        onClick: (event: any) => {
            moveBibleItemTo(event, bible);
        },
    }];
}

export default function BibleFile({
    index, filePath,
}: {
    index: number,
    filePath: string,
}) {
    const [data, setData] = useState<Bible | null | undefined>(null);
    useAppEffect(() => {
        if (data === null) {
            Bible.readFileToData(filePath).then(setData);
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
    useFSEvents(['update'], filePath, reloadCallback);
    return (
        <FileItemHandler
            index={index}
            data={data}
            reload={reloadCallback}
            filePath={filePath}
            className={'bible-file'}
            renderChild={renderChildCallback}
            isDisabledColorNote
            userClassName={`p-0 ${data?.isOpened ? 'flex-fill' : ''}`}
            contextMenu={genContextMenu(data)}
        />
    );
}

function BiblePreview({ bible }: { bible: Bible }) {
    const fileSource = FileSource.getInstance(bible.filePath);
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
                    {fileSource.name}
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
