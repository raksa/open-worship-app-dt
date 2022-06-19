import { useState } from 'react';
import FileItemHandler from '../others/FileItemHandler';
import FileSource from '../helper/FileSource';
import Slide from './Slide';

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
            onClick={() => {
                if (data) {
                    Slide.present(data.isSelected ? null : data);
                }
            }}
            child={<>
                <i className='bi bi-file-earmark-slides' />
                {fileSource.name}
            </>}
        />
    );
}
