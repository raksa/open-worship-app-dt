import { useState } from 'react';
import FileItemHandler from '../others/FileItemHandler';
import FileSource from '../helper/FileSource';
import Slide from './Slide';

export default function SlideFile({
    index, list, setList, fileSource,
}: {
    index: number,
    list: FileSource[] | null,
    setList: (newList: FileSource[] | null) => void,
    fileSource: FileSource,
}) {
    const [data, setData] = useState<Slide | null | undefined>(null);
    const selectedSlideFS = Slide.getSelectedSlideFileSource();
    const isSelected = !selectedSlideFS || !data ? false :
        data.fileSource.filePath === selectedSlideFS?.filePath;
    return (
        <FileItemHandler
            index={index}
            mimetype={'slide'}
            list={list}
            setList={setList}
            data={data}
            setData={setData}
            fileSource={fileSource}
            className={`${isSelected ? 'active' : ''}`}
            onClick={() => {
                if (data) {
                    Slide.presentSlide(isSelected ? null : data);
                }
            }}
            child={<>
                <i className='bi bi-file-earmark-slides' />
                {fileSource.name}
            </>}
        />
    );
}
