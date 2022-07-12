import { useState } from 'react';
import FileItemHandler from '../others/FileItemHandler';
import FileSource from '../helper/FileSource';
import Slide from './Slide';
import ItemColorNote from '../others/ItemColorNote';
import ItemSource from '../helper/ItemSource';
import { getIsShowingSlidePreviewer } from '../slide-presenting/Presenting';
import { previewingEventListener } from '../event/PreviewingEventListener';
import { goEditSlide } from '../App';
import { useSlideIsModifying } from './slideHelpers';

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
                    if (data.isSelected && !getIsShowingSlidePreviewer()) {
                        previewingEventListener.presentSlide(data);
                        return;
                    }
                    data.isSelected = !data.isSelected;
                }
            }}
            child={<>
                <i className='bi bi-file-earmark-slides' />
                {fileSource.name}
                {data && <RenderIsModifying slide={data} />}
                <ItemColorNote item={data as ItemSource<any>} />
            </>}
            contextMenu={[{
                title: 'Edit', onClick: () => {
                    if (data) {
                        data.isSelected = true;
                        goEditSlide();
                    }
                },
            }]}
        />
    );
}
function RenderIsModifying({ slide }: { slide: Slide }) {
    const isModifying = useSlideIsModifying(slide);
    if (!isModifying) {
        return null;
    }
    return (
        <span style={{ color: 'red' }}>*</span>
    );
}
