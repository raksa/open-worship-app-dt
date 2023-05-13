import { useStateSettingNumber } from '../helper/settingHelper';
import BibleViewSetting from './BibleViewSetting';
import BibleItemViewController from './BibleItemViewController';
import BibleViewRenderer from './BibleViewRenderer';

const MIN_FONT_SIZE = 5;
const MAX_FONT_SIZE = 150;
const STEP_FONT_SIZE = 2;

export default function BiblePreviewerRender() {
    const [fontSize, _setFontSize] = useStateSettingNumber(
        'preview-font-S=size', 16);
    const setFontSize = (fontSize: number) => {
        if (fontSize < MIN_FONT_SIZE) {
            fontSize = MIN_FONT_SIZE;
        }
        if (fontSize > MAX_FONT_SIZE) {
            fontSize = MAX_FONT_SIZE;
        }
        _setFontSize(fontSize);
    };
    const bibleItemViewController = BibleItemViewController.getInstance();
    return (
        <div className='card h-100'
            onWheel={(event) => {
                if (event.ctrlKey) {
                    setFontSize(Math.round(fontSize + event.deltaY / 10));
                }
            }}>
            <div className='card-body d-flex d-flex-row overflow-hidden h-100'>
                <BibleViewRenderer fontSize={fontSize}
                    bibleItemViewController={bibleItemViewController} />
            </div>
            <div className='card-footer p-0'>
                <BibleViewSetting
                    minFontSize={MIN_FONT_SIZE}
                    maxFontSize={MAX_FONT_SIZE}
                    stepFontSize={STEP_FONT_SIZE}
                    fontSize={fontSize}
                    setFontSize={setFontSize}
                />
            </div>
        </div>
    );
}
