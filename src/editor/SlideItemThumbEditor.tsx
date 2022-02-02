import './SlideItemThumbEditor.scss';

import { useState } from 'react';
import { useSlideItemThumbSelecting } from '../event/SlideListEventListener';
import { SlideItemThumbType } from '../helper/slideType';
import { getValidSlideItemThumbSelected, useStateSettingNumber } from '../helper/helpers';
import Tools from './Tools';
import Editor from './Editor';
import FlexResizer, { getPresentingFlexSize } from '../FlexResizer';
import { parseHTML } from './slideParser';
import { mapper } from './EditorBoxMapper';

export default function SlideItemThumbEditor() {
    const [slideItemThumb, setSlideItemThumb] = useState<SlideItemThumbType | null>(
        getValidSlideItemThumbSelected());
    useSlideItemThumbSelecting((item) => {
        if (item?.id === slideItemThumb?.id) {
            return;
        }
        if (mapper.selectedBoxEditor) {
            mapper.selectedBoxEditor.stopAllModes(() => {
                setSlideItemThumb(item);
            });
        } else {
            setSlideItemThumb(item);
        }
    });
    if (slideItemThumb === null) {
        return (
            <div className='item-thumb-editor empty' style={{ fontSize: '3em', padding: '20px' }}>
                No Slide Item Thumb Selected 😐
            </div>
        )
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
    return (
        <div className='slide-item-thumb-editor flex v w-100 h-100'>
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
                <Tools scale={scale} setScale={(s: number) => setScale(s)} />
            </div>
        </div>
    );
}
