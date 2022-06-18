import { useState } from 'react';
import FileItemHandler from '../others/FileItemHandler';
import FileSource from '../helper/FileSource';
import Bible from './Bible';
import RenderBibleItems from './RenderBibleItems';

export default function BibleFile({
    index, list, setList, fileSource,
}: {
    index: number,
    list: FileSource[] | null,
    setList: (newList: FileSource[] | null) => void,
    fileSource: FileSource,
}) {
    const [data, setData] = useState<Bible | null | undefined>(null);
    return (
        <FileItemHandler
            index={index}
            mimetype={'bible'}
            list={list}
            setList={setList}
            data={data}
            setData={setData}
            fileSource={fileSource}
            className={'bible-file'}
            onClick={async () => {
                if (data) {
                    data.isSelected = !data.isSelected;
                    setList(null);
                }
            }}
            onDrop={async (event) => {
                if (!data) {
                    return;
                }
                const receivedData = event.dataTransfer.getData('text');
                try {
                    const item = JSON.parse(receivedData);
                    if (!item.filePath) {
                        throw new Error('Not a bible file');
                    }
                    const targetFS = FileSource.genFileSource(item.filePath);
                    const targetBible = await Bible.readFileToData(targetFS);
                    if (targetBible) {
                        const bibleItem = targetBible.content.items[item.index];
                        targetBible.content.items = targetBible.content.items.filter((_, i1) => {
                            return `${i1}` !== `${item.index}`;
                        });
                        data.content.items.push(bibleItem);
                        data.save();
                        setList(null);
                    }
                } catch (error) {
                    console.log(error);
                }
            }}
            child={<div className='accordion accordion-flush'>
                <div className='accordion-header pointer'>
                    <span className='w-100 text-center'>
                        {fileSource.name}
                    </span>
                </div>
                {data && <div className={`accordion-collapse collapse ${data.isSelected ? 'show' : ''}`}>
                    <div className='accordion-body'>
                        <RenderBibleItems bible={data} index={index}
                            setBible={setData} />
                    </div>
                </div>}
            </div>}
        />
    );
}
