import {
    EventMapper as KBEventMapper, useKeyboardRegistering,
} from '../../event/KeyboardEventListener';
import { useFSEvents } from '../../helper/dirSourceHelpers';
import Slide from '../../slide-list/Slide';
import ScreenManager from '../../_screen/ScreenManager';
import MenuIsModifying from './MenuIsModifying';

const savingEventMapper: KBEventMapper = {
    allControlKey: ['Ctrl'],
    key: 's',
};
export default function SlideItemsMenu({ slide }: Readonly<{
    slide: Slide,
}>) {
    const screenDisplay = ScreenManager.getDefaultScreenDisplay();
    useFSEvents(['update'], slide.filePath);
    useKeyboardRegistering([savingEventMapper], () => {
        slide.save();
    });
    const foundWrongDimension = slide.checkIsWrongDimension(screenDisplay);
    const editCacheManager = slide.editorCacheManager;
    const undo = editCacheManager.undoQueue;
    const redo = editCacheManager.redoQueue;
    const isHavingHistories = !!undo.length || !!redo.length;
    const isShowingMenu = undo.length || redo.length || foundWrongDimension;
    return (
        <div style={{
            borderBottom: '1px solid #00000024',
            backgroundColor: '#00000020',
            minHeight: (isHavingHistories || slide.isChanged) ? '35px' : '0px',
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
                    slide={slide}
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
                            slide.fixSlideDimension(screenDisplay);
                        }}>
                        <i className='bi bi-hammer' />
                    </button>
                )}
            </div>
        </div>
    );
}
