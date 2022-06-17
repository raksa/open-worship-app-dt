import { useEffect, useState } from 'react';
import {
    useThumbSizing,
} from '../event/SlideListEventListener';
import SlideItemThumbListMenu from './SlideItemThumbListMenu';
import SlideItemThumbListItems from './SlideItemThumbListItems';
import {
    DEFAULT_THUMB_SIZE,
    THUMB_WIDTH_SETTING_NAME,
} from './SlideItemsControllerBase';
import { useSlidePresenting } from '../event/PreviewingEventListener';
import Slide from '../slide-list/Slide';
import FileSource from '../helper/FileSource';
import SlideList from '../slide-list/SlideList';
import SlideItemsController from './SlideItemsController';

export default function SlideItemThumbList() {
    const [slideFS, setSlideFS] = useState<FileSource | null>(Slide.getSelectedSlideFileSource());

    useSlidePresenting((slide) => {
        setSlideFS(slide === null ? null : slide.fileSource);
    });
    useEffect(() => {
        if (slideFS === null) {
            return;
        }
        const deleteEvent = slideFS.registerEventListener('delete', () => {
            setSlideFS(null);
        });
        const refreshEvent = slideFS.registerEventListener('refresh', () => {
            setSlideFS(Slide.getSelectedSlideFileSource());
        });
        return () => {
            slideFS.unregisterEventListener(deleteEvent);
            slideFS.unregisterEventListener(refreshEvent);
        };
    }, [slideFS]);
    useSlidePresenting((slide) => {
        setSlideFS(slide === null ? null : slide.fileSource);
    });
    return (
        <PreviewerRender fileSource={slideFS} />
    );
}
function PreviewerRender({ fileSource }: { fileSource: FileSource | null }) {
    const [thumbSize, setThumbSize] = useThumbSizing(THUMB_WIDTH_SETTING_NAME, DEFAULT_THUMB_SIZE);
    const [slide, setSlide] = useState<Slide | null | undefined>(null);
    useEffect(() => {
        Slide.readFileToDataNoCache(fileSource).then((sl) => {
            if (!sl) {
                Slide.clearSelectedSlide();
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
                const currentScale = (thumbSize / DEFAULT_THUMB_SIZE);
                const newScale = SlideItemsController.toScaleThumbSize(e.deltaY > 0, currentScale);
                setThumbSize(newScale * DEFAULT_THUMB_SIZE);
            }}
            onContextMenu={(e) => controller.showSlideItemContextMenu(e)}
            onPaste={() => controller.paste()}>
            <SlideItemThumbListMenu controller={controller} />
            <SlideItemThumbListItems controller={controller} />
        </div>
    );
}
