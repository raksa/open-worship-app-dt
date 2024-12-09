import { useCallback, useState } from 'react';

import FileItemHandler from '../others/FileItemHandler';
import FileSource from '../helper/FileSource';
import Slide from './Slide';
import ItemSource from '../helper/ItemSource';
import { getIsShowingSlidePreviewer } from '../slide-presenter/Presenter';
import { previewingEventListener } from '../event/PreviewingEventListener';
import { useFSEvents } from '../helper/dirSourceHelpers';
import { SlideDynamicType } from './slideHelpers';
import appProvider from '../server/appProvider';
import { useAppEffectAsync } from '../helper/debuggerHelpers';
import { editorTab, goToPath } from '../router/routeHelpers';

export default function SlideFile({
    index, filePath,
}: Readonly<{
    index: number,
    filePath: string,
}>) {
    const [data, setData] = useState<SlideDynamicType>(null);
    const reloadCallback = useCallback(() => {
        setData(null);
    }, [setData]);
    const onClickCallback = useCallback(() => {
        if (data) {
            if (data.isSelected && !getIsShowingSlidePreviewer()) {
                previewingEventListener.showSlide(data);
                return;
            }
            data.isSelected = true;
        }
    }, [data]);
    const renderChildCallback = useCallback((slide: ItemSource<any>) => {
        const slide1 = slide as Slide;
        return slide1.isPdf ? (
            <SlideFilePreviewPdf slide={slide1} />
        ) : (
            <SlideFilePreviewNormal slide={slide1} />
        );
    }, []);
    const onDeleteCallback = useCallback(() => {
        const selectedFilePath = Slide.getSelectedFilePath();
        if (selectedFilePath === filePath) {
            Slide.setSelectedFileSource(null);
        }
        data?.editorCacheManager.delete();
    }, [data, filePath]);
    useAppEffectAsync(async (methodContext) => {
        if (data === null) {
            const slide = await Slide.readFileToData(filePath);
            methodContext.setData(slide);
        }
    }, [data], { methods: { setData } });
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
                menuTitle: 'Preview PDF',
                onClick: () => {
                    const fileSource = FileSource.getInstance(data.filePath);
                    appProvider.messageUtils.sendData(
                        'app:preview-pdf', fileSource.src,
                    );
                },
            }] : [{
                menuTitle: 'Edit',
                onClick: () => {
                    if (data) {
                        data.isSelected = true;
                        goToPath(editorTab.routePath);
                    }
                },
            }]}
            onDelete={onDeleteCallback}
        />
    );
}


function SlideFilePreviewNormal({ slide }: Readonly<{ slide: Slide }>) {
    const fileSource = FileSource.getInstance(slide.filePath);
    return (
        <div className='w-100 h-100 app-ellipsis'>
            <i className='bi bi-file-earmark-slides' />
            {fileSource.name}
            {slide.isChanged && (
                <span style={{ color: 'red' }}>*</span>
            )}
        </div>
    );
}

function SlideFilePreviewPdf({ slide }: Readonly<{ slide: Slide }>) {
    const fileSource = FileSource.getInstance(slide.filePath);
    return (
        <div className='w-100 h-100 app-ellipsis'>
            <i className='bi bi-filetype-pdf' />
            {fileSource.name}
        </div>
    );
}
