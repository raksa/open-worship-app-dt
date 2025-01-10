import { useState } from 'react';

import FileItemHandlerComp from '../others/FileItemHandlerComp';
import FileSource from '../helper/FileSource';
import Slide, { useSelectedSlideSetterContext } from './Slide';
import ItemSource from '../helper/ItemSource';
import { getIsShowingSlidePreviewer } from '../slide-presenter/Presenter';
import { previewingEventListener } from '../event/PreviewingEventListener';
import { useFileSourceEvents } from '../helper/dirSourceHelpers';
import { SlideDynamicType } from './slideHelpers';
import { useAppEffectAsync } from '../helper/debuggerHelpers';
import { ContextMenuItemType } from '../others/AppContextMenuComp';
import { editorTab, goToPath } from '../router/routeHelpers';
import { previewPdf } from '../server/appHelpers';
import { removePdfImagesPreview } from '../helper/pdfHelpers';

export default function SlideFile({
    index,
    filePath,
}: Readonly<{
    index: number;
    filePath: string;
}>) {
    const setSelectedSlide = useSelectedSlideSetterContext();
    const [slide, setSlide] = useState<SlideDynamicType>(null);
    const handleReloading = () => {
        setSlide(null);
    };
    const handleClicking = () => {
        if (!slide) {
            return;
        }
        if (slide.isSelected && !getIsShowingSlidePreviewer()) {
            previewingEventListener.showSlide(slide);
            return;
        }
        slide.isSelected = true;
        setSelectedSlide(slide);
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
        slide?.editorCacheManager.delete();
        if (slide?.isPdf) {
            removePdfImagesPreview(filePath);
        }
    };
    useAppEffectAsync(
        async (methodContext) => {
            if (slide === null) {
                const slide = await Slide.readFileToData(filePath);
                methodContext.setData(slide);
            }
        },
        [slide],
        { setData: setSlide },
    );
    useFileSourceEvents(
        ['update', 'history-update', 'edit'],
        () => {
            setSlide(null);
        },
        [slide],
        filePath,
    );
    const menuItems: ContextMenuItemType[] | undefined = slide?.isPdf
        ? [
              {
                  menuTitle: 'Preview PDF',
                  onClick: () => {
                      previewPdf(slide.fileSource.src);
                  },
              },
              {
                  menuTitle: 'Refresh PDF Images',
                  onClick: async () => {
                      await removePdfImagesPreview(slide.filePath);
                      slide.fileSource.fireUpdateEvent();
                  },
              },
          ]
        : [
              {
                  menuTitle: 'Edit',
                  onClick: () => {
                      if (slide) {
                          slide.isSelected = true;
                          goToPath(editorTab.routePath);
                      }
                  },
              },
          ];
    return (
        <FileItemHandlerComp
            index={index}
            data={slide}
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
        <div className="w-100 h-100 app-ellipsis">
            <i className="bi bi-file-earmark-slides" />
            {fileSource.name}
            {slide.isChanged && <span style={{ color: 'red' }}>*</span>}
        </div>
    );
}

function SlideFilePreviewPdf({ slide }: Readonly<{ slide: Slide }>) {
    const fileSource = FileSource.getInstance(slide.filePath);
    return (
        <div className="w-100 h-100 app-ellipsis">
            <i className="bi bi-filetype-pdf" />
            {fileSource.name}
        </div>
    );
}
