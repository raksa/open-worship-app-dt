import { useState } from 'react';
import FileItemHandler from '../others/FileItemHandler';
import FileSource from '../helper/FileSource';
import Bible from './Bible';
import RenderBibleItems from './RenderBibleItems';
import BibleItem from './BibleItem';

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
                    const item = JSON.parse(receivedData);
                    if (!item.filePath || !BibleItem.validate(item)) {
                        throw new Error('Not a bible file');
                    }
                    const targetFS = FileSource.genFileSource(item.filePath);
                    const targetBible = await Bible.readFileToData(targetFS);
                    if (targetBible) {
                        const bibleItem = targetBible.getItemById(item.id);
                        if (bibleItem !== null) {
                            if(await targetBible.removeItem(bibleItem)){
                                await data.addItem(bibleItem);
                            }
                        }
                    }
                } catch (error) {
                    console.log(error);
                }
            }}
            child={data && <div className='accordion accordion-flush'>
                <div className='accordion-header pointer'
                    onClick={() => {
                        data?.setIsOpened(!data.isOpened);
                    }}>
                    <i className={`bi ${data.isOpened ? 'bi-chevron-down' : 'bi-chevron-right'}`} />
                    <span className='w-100 text-center'>
                        {fileSource.name}
                    </span>
                </div>
                {<div className={`accordion-collapse collapse ${data.isOpened ? 'show' : ''}`}>
                    <div className='accordion-body'>
                        <RenderBibleItems bible={data} />
                    </div>
                </div>}
            </div>}
        />
    );
}
