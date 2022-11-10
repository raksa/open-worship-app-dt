import { useEffect, useState } from 'react';
import FileItemHandler from '../others/FileItemHandler';
import FileSource from '../helper/FileSource';
import Slide from './Slide';
import ItemColorNote from '../others/ItemColorNote';
import ItemSource from '../helper/ItemSource';
import { getIsShowingSlidePreviewer } from '../slide-presenting/Presenting';
import { previewingEventListener } from '../event/PreviewingEventListener';
import { goEditSlide } from '../App';
import { useFSEvents } from '../helper/dirSourceHelpers';
import { SlideDynamicType } from './slideHelpers';
import appProvider from '../server/appProvider';

export default function SlideFile({
    index,
    fileSource,
}: {
    index: number,
    fileSource: FileSource,
}) {
    const [data, setData] = useState<SlideDynamicType>(null);
    useEffect(() => {
        if (data === null) {
            Slide.readFileToData(fileSource).then(setData);
        }
    }, [data]);
    useFSEvents(['update', 'history-update', 'edit'],
        fileSource, () => {
            setData(null);
        });
    return (
        <FileItemHandler
            index={index}
            data={data}
            reload={() => {
                setData(null);
            }}
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
            renderChild={(slide) => {
                const slide1 = slide as Slide;
                return slide1.isPdf ?
                    <SlideFilePreviewPdf slide={slide1} /> :
                    <SlideFilePreviewNormal slide={slide1} />;
            }}
            contextMenu={data?.isPdf ? [{
                title: 'Preview PDF',
                onClick: () => {
                    appProvider.messageUtils.sendData('app:preview-pdf',
                        data.fileSource.src);
                },
            }] : [{
                title: 'Edit',
                onClick: () => {
                    if (data) {
                        data.isSelected = true;
                        goEditSlide();
                    }
                },
            }]}
            onDelete={() => {
                const filePath = Slide.getSelectedFileSource()?.filePath;
                if (filePath === fileSource.filePath) {
                    Slide.setSelectedFileSource(null);
                }
                data?.editingCacheManager.delete();
            }}
        />
    );
}


function SlideFilePreviewNormal({ slide }: { slide: Slide }) {
    return (
        <>
            <i className='bi bi-file-earmark-slides' />
            {slide.fileSource.name}
            {slide.isChanged && <span
                style={{ color: 'red' }}>*</span>}
            <ItemColorNote item={slide as ItemSource<any>} />
        </>
    );
}

function SlideFilePreviewPdf({ slide }: { slide: Slide }) {
    return (
        <>
            <i className='bi bi-filetype-pdf' />
            {slide.fileSource.name}
            <ItemColorNote item={slide as ItemSource<any>} />
        </>
    );
}
