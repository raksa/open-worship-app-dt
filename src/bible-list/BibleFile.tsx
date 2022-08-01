import React, { useState } from 'react';
import FileItemHandler from '../others/FileItemHandler';
import FileSource from '../helper/FileSource';
import Bible from './Bible';
import BibleItem from './BibleItem';
import { toastEventListener } from '../event/ToastEventListener';
import AppSuspense from '../others/AppSuspense';

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
    return (
        <FileItemHandler
            index={index}
            mimetype={'bible'}
            data={data}
            setData={setData}
            fileSource={fileSource}
            className={'bible-file'}
            onDrop={async (event) => {
                if (!data) {
                    return;
                }
                const receivedData = event.dataTransfer.getData('text');
                try {
                    const json = JSON.parse(receivedData);
                    if (!json.filePath) {
                        throw new Error('Not a bible file');
                    }
                    const fromFS = FileSource.genFileSource(json.filePath);
                    const bibleItem = BibleItem.fromJson(json, fromFS);
                    data.moveItemFrom(bibleItem, fromFS);
                } catch (error: any) {
                    toastEventListener.showSimpleToast({
                        title: 'Receiving Bible Item',
                        message: error.message,
                    });
                }
            }}
            child={data && <div className='accordion accordion-flush'>
                <div className='accordion-header pointer'
                    onClick={() => {
                        if (data) {
                            data.setIsOpened(!data.isOpened);
                        }
                    }}>
                    <i className={`bi ${data.isOpened ? 'bi-chevron-down' : 'bi-chevron-right'}`} />
                    <span className='w-100 text-center'>
                        {fileSource.name}
                    </span>
                </div>
                <div className={`accordion-collapse collapse ${data.isOpened ? 'show' : ''}`}>
                    {data.isOpened && <div className='accordion-body'>
                        <AppSuspense>
                            <RenderBibleItems bible={data} />
                        </AppSuspense>
                    </div>}
                </div>
            </div>}
        />
    );
}
