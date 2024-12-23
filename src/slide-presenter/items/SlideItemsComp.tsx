import { useState, useTransition } from 'react';

import {
    KeyboardType, useKeyboardRegistering,
} from '../../event/KeyboardEventListener';
import {
    useSlideItemThumbnailSizeScale,
} from '../../event/SlideListEventListener';
import SlideItemGhost from './SlideItemGhost';
import Slide, { useSelectedSlideContext } from '../../slide-list/Slide';
import { genArrowListener } from './slideItemHelpers';
import SlideItemRenderWrapper from './SlideItemRenderWrapper';
import { DEFAULT_THUMBNAIL_SIZE_FACTOR } from '../../slide-list/slideHelpers';
import SlideItem, {
    useSelectedEditingSlideItemSetterContext,
} from '../../slide-list/SlideItem';
import appProvider from '../../server/appProvider';
import { useAppEffect } from '../../helper/debuggerHelpers';
import { useFileSourceEvents } from '../../helper/dirSourceHelpers';
import { genPdfImagesPreview } from '../../helper/pdfHelpers';
import LoadingComp from '../../others/LoadingComp';

async function getSlideItems(slide: Slide) {
    if (!slide.isPdf) {
        return slide.items;
    }
    const imageFileInfoList = await genPdfImagesPreview(slide.filePath);
    if (imageFileInfoList === null) {
        return null;
    }
    return imageFileInfoList.map(({ src, pageNumber, width, height }) => {
        return SlideItem.fromPdfJson({
            filePath: slide.filePath, pageNumber, src, width, height,
        });
    });
}

const slideItemsToView: { [key: string]: SlideItem } = {};
function useSlideItems() {
    const selectedSlide = useSelectedSlideContext();
    const setSelectedSlideItem = useSelectedEditingSlideItemSetterContext();

    const [slideItems, setSlideItems] = useState<SlideItem[] | null>(null);
    const [isPending, startTransition] = useTransition();
    const startLoading = () => {
        startTransition(async () => {
            const newSlideItems = await getSlideItems(selectedSlide);
            setSlideItems(newSlideItems);
        });
    };
    useAppEffect(startLoading, [selectedSlide]);

    useFileSourceEvents(['new'], async (newSlideItem: SlideItem) => {
        let newSlideItems = await getSlideItems(selectedSlide);
        if (newSlideItems === null) {
            setSlideItems(null);
            return;
        }
        newSlideItems = newSlideItems.map((slideItem) => {
            if (slideItem.checkIsSame(newSlideItem)) {
                slideItemsToView[newSlideItem.id] = newSlideItem;
                return newSlideItem;
            } else {
                return slideItem;
            }
        });
        setSlideItems(newSlideItems);
    }, [selectedSlide], selectedSlide.filePath);
    useFileSourceEvents(
        ['edit'], (editingSlideItem: any) => {
            if (
                !(editingSlideItem instanceof SlideItem) || slideItems === null
            ) {
                return;
            }
            const newSlideItems = slideItems.map((item) => {
                if (item.checkIsSame(editingSlideItem)) {
                    return editingSlideItem;
                } else {
                    return item;
                }
            });
            setSlideItems(newSlideItems);
        }, [slideItems], selectedSlide.filePath
    );
    useFileSourceEvents(
        ['update', 'delete'], startLoading, undefined, selectedSlide.filePath
    );

    const arrows: KeyboardType[] = ['ArrowLeft', 'ArrowRight'];
    const arrowListener = (
        appProvider.isPageEditor ? () => { } : genArrowListener(
            setSelectedSlideItem, slideItems || [],
        )
    );
    useKeyboardRegistering(arrows.map((key) => {
        return { key };
    }), arrowListener);

    useAppEffect(() => {
        const slideItems = Object.values(slideItemsToView);
        if (slideItems.length === 0) {
            return;
        }
        slideItems.forEach((slideItem) => {
            slideItem.showInViewport();
        });
        Object.keys(slideItemsToView).forEach((key) => {
            delete slideItemsToView[key];
        });
    });

    return { slideItems, isPending, startLoading };
}

export default function SlideItemsComp() {
    const [thumbSizeScale] = useSlideItemThumbnailSizeScale();
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
    const { slideItems, isPending, startLoading } = useSlideItems();
    const slideItemThumbnailSize = (
        thumbSizeScale * DEFAULT_THUMBNAIL_SIZE_FACTOR
    );
    if (isPending) {
        return (
            <LoadingComp />
        );
    }
    if (slideItems === null) {
        return (
            <div className='d-flex justify-content-center'>
                <p className='alert alert-warning'>Fail to load slide items</p>
                <button onClick={startLoading} className='btn btn-primary'>
                    Reload
                </button>
            </div>
        );
    }
    return (
        <div className='d-flex flex-wrap justify-content-center'>
            {slideItems.map((slideItem, i) => {
                return (
                    <SlideItemRenderWrapper key={slideItem.id}
                        draggingIndex={draggingIndex}
                        thumbSize={slideItemThumbnailSize}
                        slideItem={slideItem}
                        index={i}
                        setDraggingIndex={setDraggingIndex}
                    />
                );
            })}
            {Array.from({ length: 2 }, (_, i) => {
                return (
                    <SlideItemGhost key={`${i}`}
                        width={slideItemThumbnailSize}
                    />
                );
            })}
        </div>
    );
}
