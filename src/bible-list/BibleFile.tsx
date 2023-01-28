import React, { useCallback, useEffect, useState } from 'react';
import FileItemHandler from '../others/FileItemHandler';
import FileSource from '../helper/FileSource';
import Bible from './Bible';
import BibleItem from './BibleItem';
import AppSuspense from '../others/AppSuspense';
import { isValidJson } from '../helper/helpers';
import ItemSource from '../helper/ItemSource';
import { showSimpleToast } from '../toast/toastHelpers';

const RenderBibleItems = React.lazy(() => {
    return import('./RenderBibleItems');
});

export default function BibleFile({
    index, fileSource,
}: {
    index: number,
    fileSource: FileSource,
}) {
    const [data, setData] = useState<Bible | null | undefined>(null);
    const onDropCallback = useCallback(async (event: any) => {
        if (!data) {
            return;
        }
        const str = event.dataTransfer.getData('text');
        try {
            if (!isValidJson(str)) {
                return;
            }
            const json = JSON.parse(str);
            if (!json.filePath) {
                throw new Error('Not a bible file');
            }
            const fromFS = FileSource.getInstance(json.filePath);
            const bibleItem = BibleItem.fromJson(json, fromFS);
            data.moveItemFrom(bibleItem, fromFS);
        } catch (error: any) {
            showSimpleToast('Receiving Bible Item', error.message);
        }
    }, []);
    useEffect(() => {
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
            onDrop={onDropCallback}
            renderChild={renderChildCallback}
        />
    );
}

function BiblePreview({ bible }: { bible: Bible }) {
    return (
        <div className='accordion accordion-flush'>
            <div className='accordion-header pointer'
                onClick={() => {
                    bible.setIsOpened(!bible.isOpened);
                }}>
                <i className={`bi ${bible.isOpened ?
                    'bi-chevron-down' : 'bi-chevron-right'}`} />
                <span className='w-100 text-center'>
                    {bible.fileSource.name}
                </span>
            </div>
            <div className={`accordion-collapse collapse ${bible.isOpened ?
                'show' : ''}`}
                style={{
                    overflow: 'auto',
                }}>
                {bible.isOpened && <div className='accordion-body'>
                    <AppSuspense>
                        <RenderBibleItems bible={bible} />
                    </AppSuspense>
                </div>}
            </div>
        </div>
    );
}
