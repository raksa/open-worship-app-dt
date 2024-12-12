import { useState } from 'react';

import FileItemHandler from '../others/FileItemHandler';
import FileSource from '../helper/FileSource';
import Slide, { useSelectedSlideContext } from './Slide';
import ItemSource from '../helper/ItemSource';
import { getIsShowingSlidePreviewer } from '../slide-presenter/Presenter';
import { previewingEventListener } from '../event/PreviewingEventListener';
import { useFSEvents } from '../helper/dirSourceHelpers';
import { SlideDynamicType } from './slideHelpers';
import appProvider from '../server/appProvider';
import { useAppEffectAsync } from '../helper/debuggerHelpers';
import { editorTab, goToPath } from '../router/routeHelpers';
import { ContextMenuItemType } from '../others/AppContextMenu';

export default function SlideFile({
    index, filePath,
}: Readonly<{
    index: number,
    filePath: string,
}>) {
    const { setSelectedSlide } = useSelectedSlideContext();
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
        if (selectedFilePath === filePath) {
            Slide.setSelectedFileSource(null);
        }
        data?.editorCacheManager.delete();
    };
    useAppEffectAsync(async (methodContext) => {
        if (data === null) {
            const slide = await Slide.readFileToData(filePath);
            methodContext.setData(slide);
        }
    }, [data], { methods: { setData } });
    useFSEvents(['update', 'history-update', 'edit'], filePath, () => {
        setData(null);
    });
    const contextMenuItems: ContextMenuItemType[] | undefined = data?.isPdf ? [{
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
            contextMenuItems={contextMenuItems}
            onDelete={handleSlideDeleting}
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
