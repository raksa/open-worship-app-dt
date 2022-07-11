import { useEffect, useState } from 'react';
import {
    useSlideItemSizing,
} from '../event/SlideListEventListener';
import SlideItemsMenu from './SlideItemsMenu';
import SlideFile from './SlideFile';
import {
    DEFAULT_THUMBNAIL_SIZE,
    THUMBNAIL_WIDTH_SETTING_NAME,
} from './SlideItemsControllerBase';
import { useSlideSelecting } from '../event/PreviewingEventListener';
import Slide from '../slide-list/Slide';
import FileSource from '../helper/FileSource';
import SlideList from '../slide-list/SlideList';
import SlideItemsController from './SlideItemsController';

export default function SlideItemList() {
    const [slideFS, setSlideFS] = useState<FileSource | null>(Slide.getSelectedFileSource());

    useSlideSelecting((slide) => {
        setSlideFS(slide === null ? null : slide.fileSource);
    });
    useEffect(() => {
        if (slideFS === null) {
            return;
        }
        const refreshEvents = slideFS.registerEventListener(['update'], () => {
            setSlideFS(Slide.getSelectedFileSource());
        });
        return () => {
            slideFS.unregisterEventListener(refreshEvents);
        };
    }, [slideFS]);
    useSlideSelecting((slide) => {
        setSlideFS(slide === null ? null : slide.fileSource);
    });
    return (
        <PreviewerRender fileSource={slideFS} />
    );
}
function PreviewerRender({ fileSource }: { fileSource: FileSource | null }) {
    const [thumbSize, setThumbSize] = useSlideItemSizing(THUMBNAIL_WIDTH_SETTING_NAME,
        DEFAULT_THUMBNAIL_SIZE);
    const [slide, setSlide] = useState<Slide | null | undefined>(null);
    useEffect(() => {
        Slide.readFileToDataNoCache(fileSource).then((sl) => {
            if (!sl) {
                Slide.setSelectedFileSource(null);
            }
            setSlide(sl);
        });
    }, [fileSource]);
    if (fileSource === null) {
        return (
            <SlideList />
        );
    }
    if (slide === null) {
        return null;
    }
    if (slide === undefined) {
        return (
            <div className="alert alert-warning">
                No Slide Available
            </div>
        );
    }
    const controller = new SlideItemsController(slide);
    return (
        <div className='w-100 h-100' style={{ overflow: 'auto' }}
            onWheel={(e) => {
                if (!e.ctrlKey) {
                    return;
                }
                const currentScale = (thumbSize / DEFAULT_THUMBNAIL_SIZE);
                const newScale = SlideItemsController.toScaleThumbSize(e.deltaY > 0, currentScale);
                setThumbSize(newScale * DEFAULT_THUMBNAIL_SIZE);
            }}
            onContextMenu={(e) => controller.showSlideItemContextMenu(e)}
            onPaste={() => controller.paste()}>
            <SlideItemsMenu controller={controller} />
            <SlideFile controller={controller} />
        </div>
    );
}
