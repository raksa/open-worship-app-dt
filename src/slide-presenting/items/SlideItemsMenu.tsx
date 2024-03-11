import {
    EventMapper as KBEventMapper, useKeyboardRegistering,
} from '../../event/KeyboardEventListener';
import { useFSEvents } from '../../helper/dirSourceHelpers';
import Slide from '../../slide-list/Slide';
import PresentManager from '../../_present/PresentManager';
import MenuIsModifying from './MenuIsModifying';
import { useEditingHistoryStatus } from '../../others/EditingHistoryManager';

const savingEventMapper: KBEventMapper = {
    allControlKey: ['Ctrl'],
    key: 's',
};
export default function SlideItemsMenu({ slide }: Readonly<{
    slide: Slide,
}>) {
    const [canUndo, canRedo] = useEditingHistoryStatus(slide.filePath);
    const presentDisplay = PresentManager.getDefaultPresentDisplay();
    useFSEvents(['update'], slide.filePath);
    useKeyboardRegistering([savingEventMapper], () => {
        slide.save();
    });
    const foundWrongDimension = slide.checkIsWrongDimension(presentDisplay);
    const isSlideChanged = canUndo || canRedo;
    const isShowingMenu = isSlideChanged || foundWrongDimension;
    return (
        <div style={{
            borderBottom: '1px solid #00000024',
            backgroundColor: '#00000020',
            minHeight: isSlideChanged ? '35px' : '0px',
            display: isShowingMenu ? 'block' : 'none',
        }}>
            <div className='btn-group control d-flex justify-content-center'>
                <button type='button' className='btn btn-sm btn-info'
                    title='clear all' disabled={!canUndo}
                    onClick={() => {
                        slide.undo();
                    }}>
                    undo <i className='bi bi-arrow-90deg-left' />
                </button>
                <button type='button'
                    className='btn btn-sm btn-info'
                    title='clear background'
                    disabled={!canRedo}
                    onClick={() => {
                        slide.redo();
                    }}>
                    redo <i className='bi bi-arrow-90deg-right' />
                </button>
                <MenuIsModifying
                    slide={slide}
                    isSlideChanged={isSlideChanged}
                    eventMapper={savingEventMapper} />
                {foundWrongDimension !== null &&
                    <button type='button'
                        className='btn btn-sm btn-warning'
                        title={Slide.toWrongDimensionString(
                            foundWrongDimension)}
                        onClick={() => {
                            slide.fixSlideDimension(presentDisplay);
                        }}>
                        Fix Slide Dimension
                    </button>
                }
            </div>
        </div>
    );
}
