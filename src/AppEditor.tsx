import { lazy, useMemo, useState } from 'react';

import { resizeSettingNames } from './resize-actor/flexSizeHelpers';
import ResizeActor from './resize-actor/ResizeActor';
import SlideItem, { SelectedSlideItemContext } from './slide-list/SlideItem';
import Slide, { SelectedSlideContext } from './slide-list/Slide';
import { useStateSettingString } from './helper/settingHelpers';
import { useAppEffectAsync } from './helper/debuggerHelpers';
import { MultiContextRender } from './helper/MultiContextRender';

const LazySlideItemEditorGround = lazy(() => {
    return import('./slide-editor/SlideItemEditorGround');
});
const LazySlidePreviewer = lazy(() => {
    return import('./slide-presenter/items/SlidePreviewer');
});

export default function AppEditor() {
    const [slideFilePath, setSlideFilePath] = useStateSettingString(
        'selected-slide',
    );
    const [selectedSlide, setSelectedSlide] = useState<Slide | null>(null);
    useAppEffectAsync(async (methodContext) => {
        const slide = await Slide.readFileToData(slideFilePath);
        if (slide) {
            methodContext.setSelectedSlide(slide);
        }
    }, undefined, { methods: { setSelectedSlide } });
    const [selectedSlideItem, setSelectedSlideItem] = (
        useState<SlideItem | null>(null)
    );
    const slideValue = useMemo(() => {
        return {
            selectedSlide: selectedSlide as Slide,
            setSelectedSlide: (newSelectedSlide: Slide) => {
                setSelectedSlide(newSelectedSlide);
                const firstSlideItem = newSelectedSlide.items[0];
                setSelectedSlideItem(firstSlideItem);
                setSlideFilePath(newSelectedSlide.filePath);
            },
        };
    }, [selectedSlide, setSelectedSlide]);
    const slideItemValue = useMemo(() => {
        return {
            selectedSlideItem: selectedSlideItem as SlideItem,
            setSelectedSlideItem: (newSelectedSlideItem: SlideItem) => {
                setSelectedSlideItem(newSelectedSlideItem);
            },
        };
    }, [selectedSlideItem, setSelectedSlideItem]);
    if (selectedSlide === null || selectedSlideItem) {
        return (
            <div className='alert alert-warning'>
                "No Slide Selected" please select one!
            </div>
        );
    }
    return (
        <MultiContextRender contexts={[{
            context: SelectedSlideContext,
            value: slideValue,
        }, {
            context: SelectedSlideItemContext,
            value: slideItemValue,
        }]}>

            <ResizeActor fSizeName={resizeSettingNames.appEditor}
                isHorizontal
                flexSizeDefault={{
                    'h1': ['1'],
                    'h2': ['3'],
                }}
                dataInput={[
                    {
                        children: LazySlidePreviewer, key: 'h1',
                        widgetName: 'App Editor Left',
                    },
                    {
                        children: LazySlideItemEditorGround, key: 'h2',
                        widgetName: 'Slide Item Editor Ground',
                    },
                ]}
            />
        </MultiContextRender>
    );
}
