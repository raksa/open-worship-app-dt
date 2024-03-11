import {
    EventMapper as KBEventMapper, useKeyboardRegistering,
} from '../../event/KeyboardEventListener';
import { useFSEvents } from '../../helper/dirSourceHelpers';
import Slide from '../../slide-list/Slide';
import PresentManager from '../../_present/PresentManager';
import MenuIsModifying from './MenuIsModifying';

const savingEventMapper: KBEventMapper = {
    allControlKey: ['Ctrl'],
    key: 's',
};
export default function SlideItemsMenu({ slide }: Readonly<{
    slide: Slide,
}>) {
    const presentDisplay = PresentManager.getDefaultPresentDisplay();
    useFSEvents(['update'], slide.filePath);
    useKeyboardRegistering([savingEventMapper], () => {
        slide.save();
    });
    const foundWrongDimension = slide.checkIsWrongDimension(presentDisplay);
    const editHistoryManager = slide.editingHistoryManager;
    const undo = editHistoryManager.undoQueue;
    const redo = editHistoryManager.redoQueue;
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
                    title='clear all' disabled={!undo.length}
                    onClick={() => {
                        editHistoryManager.popUndo();
                    }}>
                    undo <i className='bi bi-arrow-90deg-left' />
                </button>
                <button type='button'
                    className='btn btn-sm btn-info'
                    title='clear background'
                    disabled={redo.length === 0}
                    onClick={() => {
                        editHistoryManager.popRedo();
                    }}>
                    redo <i className='bi bi-arrow-90deg-right' />
                </button>
                <MenuIsModifying
                    slide={slide}
                    isHavingHistories={isHavingHistories}
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
