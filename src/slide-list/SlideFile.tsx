import { useState } from 'react';

import FileItemHandler from '../others/FileItemHandler';
import FileSource from '../helper/FileSource';
import Slide, { useSelectedSlideSetterContext } from './Slide';
import ItemSource from '../helper/ItemSource';
import { getIsShowingSlidePreviewer } from '../slide-presenter/Presenter';
import { previewingEventListener } from '../event/PreviewingEventListener';
import { useFileSourceEvents } from '../helper/dirSourceHelpers';
import { SlideDynamicType } from './slideHelpers';
import appProvider from '../server/appProvider';
import { useAppEffectAsync } from '../helper/debuggerHelpers';
import { ContextMenuItemType } from '../others/AppContextMenu';
import { editorTab, goToPath } from '../router/routeHelpers';

export default function SlideFile({
    index, filePath,
}: Readonly<{
    index: number,
    filePath: string,
}>) {
    const setSelectedSlide = useSelectedSlideSetterContext();
    const [data, setData] = useState<SlideDynamicType>(null);
    const handleReloading = () => {
        setData(null);
    };
    const handleClicking = () => {
        if (!data) {
            return;
        }
        if (data.isSelected && !getIsShowingSlidePreviewer()) {
            previewingEventListener.showSlide(data);
            return;
        }
        data.isSelected = true;
        setSelectedSlide(data);
    };
    const handleChildRendering = (slide: ItemSource<any>) => {
        const slide1 = slide as Slide;
        return slide1.isPdf ? (
            <SlideFilePreviewPdf slide={slide1} />
        ) : (
            <SlideFilePreviewNormal slide={slide1} />
        );
    };
    const handleSlideDeleting = () => {
        const selectedFilePath = Slide.getSelectedFilePath();
        if (selectedFilePath === null || selectedFilePath === filePath) {
            Slide.setSelectedFileSource(null);
            setSelectedSlide(null);
        }
        data?.editorCacheManager.delete();
    };
    useAppEffectAsync(async (methodContext) => {
        if (data === null) {
            const slide = await Slide.readFileToData(filePath);
            methodContext.setData(slide);
        }
    }, [data], { setData });
    useFileSourceEvents(['update', 'history-update', 'edit'], () => {
        setData(null);
    }, [data], filePath);
    const menuItems: ContextMenuItemType[] | undefined = data?.isPdf ? [{
        menuTitle: 'Preview PDF',
        onClick: () => {
            appProvider.messageUtils.sendData(
                'app:preview-pdf', data.fileSource.src,
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
    }];
    return (
        <FileItemHandler
            index={index}
            data={data}
            reload={handleReloading}
            filePath={filePath}
            isPointer
            onClick={handleClicking}
            renderChild={handleChildRendering}
            contextMenuItems={menuItems}
            onTrashed={handleSlideDeleting}
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
