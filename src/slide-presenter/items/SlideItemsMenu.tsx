import {
    EventMapper as KBEventMapper, useKeyboardRegistering,
} from '../../event/KeyboardEventListener';
import { useFileSourceEvents } from '../../helper/dirSourceHelpers';
import Slide, { useSelectedSlideContext } from '../../slide-list/Slide';
import ScreenManager from '../../_screen/ScreenManager';
import MenuIsModifying from './MenuIsModifying';

const savingEventMapper: KBEventMapper = {
    allControlKey: ['Ctrl'],
    key: 's',
};
export default function SlideItemsMenu() {
    const selectedSlide = useSelectedSlideContext();
    const screenDisplay = ScreenManager.getDefaultScreenDisplay();
    useFileSourceEvents(['history-update'], selectedSlide.filePath);
    useKeyboardRegistering([savingEventMapper], () => {
        selectedSlide.save();
    });
    const foundWrongDimension = selectedSlide.checkIsWrongDimension(
        screenDisplay,
    );
    const editCacheManager = selectedSlide.editorCacheManager;
    const undo = editCacheManager.undoQueue;
    const redo = editCacheManager.redoQueue;
    const isHavingHistories = !!undo.length || !!redo.length;
    const isShowingMenu = undo.length || redo.length || foundWrongDimension;
    return (
        <div style={{
            borderBottom: '1px solid #00000024',
            backgroundColor: '#00000020',
            minHeight: (
                (isHavingHistories || selectedSlide.isChanged) ? '35px' : '0px'
            ),
            display: isShowingMenu ? 'block' : 'none',
        }}>
            <div className='btn-group control d-flex justify-content-center'>
                <button type='button' className='btn btn-sm btn-info'
                    title='Undo'
                    disabled={!undo.length}
                    onClick={() => {
                        editCacheManager.popUndo();
                    }}>
                    <i className='bi bi-arrow-90deg-left' />
                </button>
                <button type='button'
                    className='btn btn-sm btn-info'
                    title='Redo'
                    disabled={redo.length === 0}
                    onClick={() => {
                        editCacheManager.popRedo();
                    }}>
                    <i className='bi bi-arrow-90deg-right' />
                </button>
                <MenuIsModifying
                    isHavingHistories={isHavingHistories}
                    eventMapper={savingEventMapper}
                />
                {foundWrongDimension !== null && (
                    <button type='button'
                        className='btn btn-sm btn-warning'
                        title={
                            'Fix slide dimension: ' +
                            Slide.toWrongDimensionString(foundWrongDimension)
                        }
                        onClick={() => {
                            selectedSlide.fixSlideDimension(screenDisplay);
                        }}>
                        <i className='bi bi-hammer' />
                    </button>
                )}
            </div>
        </div>
    );
}
