import { useStateSettingNumber } from '../helper/settingHelper';
import Tools from './Tools';
import Editor from './Editor';
import ReSizer from '../resizer/ReSizer';
import SlideItem from '../slide-presenting/SlideItem';
import HTML2React from '../slide-editing/HTML2React';

export default function SlideItemThumbEditorController({ slideItemThumb }: {
    slideItemThumb: SlideItem
}) {
    const resizeSettingName = 'editor-window-size';
    const flexSizeDefault = {
        'editor-v1': '3',
        'editor-v2': '1',
    };
    const [scale, setScale] = useStateSettingNumber('editor-scale', 1);
    const html2React = HTML2React.parseHTML(slideItemThumb.html);
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
        <div className='slide-item-thumb-editor flex v w-100 h-100'
            onWheel={(e) => {
                if (e.ctrlKey) {
                    applyScale(e.deltaY > 0);
                }
            }}>
            <ReSizer settingName={resizeSettingName}
                flexSizeDefault={flexSizeDefault}
                resizerKinds={['v']}
                sizeKeys={[
                    ['editor-v1', 'flex-item'],
                    ['editor-v2', 'flex-item']]}>
                <div className='editor-container w-100 h-100'>
                    <div className='overflow-hidden' style={{
                        width: `${html2React.width * scale + 20}px`,
                        height: `${html2React.height * scale + 20}px`,
                    }}>
                        <div className='w-100 h-100' style={{
                            transform: `scale(${scale.toFixed(1)}) translate(50%, 50%)`,
                        }}>
                            <Editor scale={scale} slideItemThumb={slideItemThumb}
                                html2React={html2React} />
                        </div>
                    </div>
                </div>
                <Tools scale={scale} applyScale={applyScale} setScale={setScale}
                    minScale={minScale} maxScale={maxScale} scaleStep={scaleStep} />
            </ReSizer>
        </div>
    );
}
