import { useState } from 'react';
import FileItemHandler from '../others/FileItemHandler';
import FileSource from '../helper/FileSource';
import Slide from './Slide';
import { FileListType } from '../others/FileListHandler';

export default function SlideFile({
    index, list, setList, fileSource,
}: {
    index: number,
    list: FileListType,
    setList: (newList: FileListType) => void,
    fileSource: FileSource,
}) {
    const [data, setData] = useState<Slide | null | undefined>(null);
    return (
        <FileItemHandler
            index={index}
            mimetype={'slide'}
            list={list}
            setList={setList}
            data={data}
            setData={setData}
            fileSource={fileSource}
            className={`${data?.isSelected ? 'active' : ''}`}
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
