import React, { useEffect, useState } from 'react';
import FileItemHandler from '../others/FileItemHandler';
import FileSource from '../helper/FileSource';
import Bible from './Bible';
import BibleItem from './BibleItem';
import ToastEventListener from '../event/ToastEventListener';
import AppSuspense from '../others/AppSuspense';
import { isValidJson } from '../helper/helpers';

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
    useEffect(() => {
        if (data === null) {
            Bible.readFileToData(fileSource).then(setData);
        }
    }, [data]);
    return (
        <FileItemHandler
            index={index}
            data={data}
            reload={() => {
                setData(null);
            }}
            fileSource={fileSource}
            className={'bible-file'}
            onDrop={async (event) => {
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
                    ToastEventListener.showSimpleToast({
                        title: 'Receiving Bible Item',
                        message: error.message,
                    });
                }
            }}
            renderChild={(bible) => {
                return (
                    <BiblePreview bible={bible as Bible} />
                );
            }}
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
