import { useState } from 'react';
import FileItemHandler from '../others/FileItemHandler';
import FileSource from '../helper/FileSource';
import Slide from './Slide';
import BibleItemColorNote from '../bible-list/BibleItemColorNote';
import ItemSource from '../helper/ItemSource';

export default function SlideFile({
    index, fileSource,
}: {
    index: number,
    fileSource: FileSource,
}) {
    const [data, setData] = useState<Slide | null | undefined>(null);
    return (
        <FileItemHandler
            index={index}
            mimetype={'slide'}
            data={data}
            setData={setData}
            fileSource={fileSource}
            isPointer
            onClick={() => {
                if (data) {
                    data.isSelected = !data.isSelected;
                }
            }}
            child={<>
                <i className='bi bi-file-earmark-slides' />
                {fileSource.name}
                <BibleItemColorNote item={data as ItemSource<any>} />
            </>}
        />
    );
}
