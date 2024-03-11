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
import { useEditingHistoryStatus } from '../others/EditingHistoryManager';

export default function SlideFile({
    index, filePath,
}: Readonly<{
    index: number,
    filePath: string,
}>) {
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
        const selectedFilePath = Slide.getSelectedFilePath();
        if (selectedFilePath === filePath) {
            Slide.setSelectedFileSource(null);
        }
        data?.delete();
    }, [data, filePath]);
    useAppEffect(() => {
        if (data === null) {
            Slide.readFileToData(filePath).then(setData);
        }
    }, [data]);
    useFSEvents(['update', 'history-update', 'edit'], filePath, () => {
        setData(null);
    });
    return (
        <FileItemHandler
            index={index}
            data={data}
            reload={reloadCallback}
            filePath={filePath}
            isPointer
            onClick={onClickCallback}
            renderChild={renderChildCallback}
            contextMenu={data?.isPdf ? [{
                title: 'Preview PDF',
                onClick: () => {
                    const fileSource = FileSource.getInstance(data.filePath);
                    appProvider.messageUtils.sendData(
                        'app:preview-pdf', fileSource.src,
                    );
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


function SlideFilePreviewNormal({ slide }: Readonly<{ slide: Slide }>) {
    const editingStatus = useEditingHistoryStatus(slide.filePath);
    const fileSource = FileSource.getInstance(slide.filePath);
    const isSlideChanged = editingStatus[0] || editingStatus[1];
    return (
        <div className='w-100 h-100 app-ellipsis'>
            <i className='bi bi-file-earmark-slides' />
            {fileSource.name}
            {isSlideChanged && <span style={{ color: 'red' }}>*</span>}
        </div>
    );
}

function SlideFilePreviewPdf({ slide }: Readonly<{ slide: Slide }>) {
    const fileSource = FileSource.getInstance(slide.filePath);
    return (
        <>
            <i className='bi bi-filetype-pdf' />
            {fileSource.name}
        </>
    );
}
