import { useCallback, useState } from 'react';
import FileItemHandler from '../others/FileItemHandler';
import FileSource from '../helper/FileSource';
import Slide from './Slide';
import ItemSource from '../helper/ItemSource';
import { getIsShowingSlidePreviewer } from '../slide-presenting/Presenting';
import { previewingEventListener } from '../event/PreviewingEventListener';
import { useFSEvents } from '../helper/dirSourceHelpers';
import { SlideDynamicType } from './slideHelpers';
import appProvider from '../server/appProvider';
import { useAppEffect } from '../helper/debuggerHelpers';
import { useNavigate } from 'react-router-dom';
import { goEditingMode } from '../router/routeHelpers';

export default function SlideFile({
    index,
    fileSource,
}: {
    index: number,
    fileSource: FileSource,
}) {
    const navigator = useNavigate();
    const [data, setData] = useState<SlideDynamicType>(null);
    const reloadCallback = useCallback(() => {
        setData(null);
    }, [setData]);
    const onClickCallback = useCallback(() => {
        if (data) {
            if (data.isSelected && !getIsShowingSlidePreviewer()) {
                previewingEventListener.presentSlide(data);
                return;
            }
            data.isSelected = !data.isSelected;
        }
    }, [data]);
    const renderChildCallback = useCallback((slide: ItemSource<any>) => {
        const slide1 = slide as Slide;
        return slide1.isPdf ?
            <SlideFilePreviewPdf slide={slide1} /> :
            <SlideFilePreviewNormal slide={slide1} />;
    }, []);
    const onDeleteCallback = useCallback(() => {
        const filePath = Slide.getSelectedFileSource()?.filePath;
        if (filePath === fileSource.filePath) {
            Slide.setSelectedFileSource(null);
        }
        data?.editingCacheManager.delete();
    }, [data, fileSource]);
    useAppEffect(() => {
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
            reload={reloadCallback}
            fileSource={fileSource}
            isPointer
            onClick={onClickCallback}
            renderChild={renderChildCallback}
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
                        goEditingMode(navigator);
                    }
                },
            }]}
            onDelete={onDeleteCallback}
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
        </>
    );
}

function SlideFilePreviewPdf({ slide }: { slide: Slide }) {
    return (
        <>
            <i className='bi bi-filetype-pdf' />
            {slide.fileSource.name}
        </>
    );
}
