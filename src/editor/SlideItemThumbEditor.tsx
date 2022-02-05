import './SlideItemThumbEditor.scss';

import { useState } from 'react';
import { useSlideItemThumbSelecting } from '../event/SlideListEventListener';
import { SlideItemThumbType } from './slideType';
import { useStateSettingNumber } from '../helper/settingHelper';
import Tools from './Tools';
import Editor from './Editor';
import FlexResizer, { getPresentingFlexSize } from '../FlexResizer';
import { parseHTML } from './slideParser';
import { editorMapper } from './EditorBoxMapper';
import { getValidSlideItemThumbSelected } from '../slide-presenting/SlideItemThumbList';
import { slideListEventListener } from '../slide-list/SlideList';

export default function SlideItemThumbEditor() {
    const [slideItemThumb, setSlideItemThumb] = useState<SlideItemThumbType | null>(
        getValidSlideItemThumbSelected());
    useSlideItemThumbSelecting(slideListEventListener, (item) => {
        if (item?.id === slideItemThumb?.id) {
            return;
        }
        editorMapper.stopAllModes().then(() => {
            setSlideItemThumb(item);
        });
    });
    if (slideItemThumb === null) {
        return (
            <div className='item-thumb-editor empty' style={{ fontSize: '3em', padding: '20px' }}>
                No Slide Item Thumb Selected 😐
            </div>
        );
    }
    return (
        <SlideItemThumbEditorController slideItemThumb={slideItemThumb} />
    );
}
export function SlideItemThumbEditorController({ slideItemThumb }: {
    slideItemThumb: SlideItemThumbType
}) {
    const resizeSettingName = 'editor-window-size';
    const flexSize = getPresentingFlexSize(resizeSettingName, {
        'editor-v1': '3',
        'editor-v2': '1',
    });
    const [scale, setScale] = useStateSettingNumber('editor-scale', 1);
    const data = parseHTML(slideItemThumb.html);
    const maxScale = 3;
    const minScale = 0.2;
    const scaleStep = 0.1;
    const applyScale = (isUp: boolean) => {
        let newScale = scale + (isUp ? -1 : 1) * scaleStep;
        if (newScale < minScale) {
            newScale = minScale;
        }
        if (newScale > maxScale) {
            newScale = maxScale;
        }
        setScale(newScale);
    };
    return (
        <div className='slide-item-thumb-editor flex v w-100 h-100' onWheel={(e) => {
            if (e.ctrlKey) {
                applyScale(e.deltaY > 0);
            }
        }}>
            <div data-fs='editor-v1' className='flex-item' style={{ flex: flexSize['editor-v1'] || 1 }}>
                <div className='editor-container w-100 h-100'>
                    <div className='overflow-hidden' style={{
                        width: `${data.width * scale + 20}px`,
                        height: `${data.height * scale + 20}px`,
                    }}>
                        <div className='w-100 h-100' style={{
                            transform: `scale(${scale.toFixed(1)}) translate(50%, 50%)`,
                        }}>
                            <Editor scale={scale} slideItemThumb={slideItemThumb} data={data}
                                {...data} />
                        </div>
                    </div>
                </div>
            </div>
            <FlexResizer settingName={resizeSettingName} type='v' />
            <div data-fs='editor-v2' className='flex-item' style={{ flex: flexSize['editor-v2'] || 1 }}>
                <Tools scale={scale} applyScale={applyScale} setScale={setScale}
                    minScale={minScale} maxScale={maxScale} scaleStep={scaleStep} />
            </div>
        </div>
    );
}
