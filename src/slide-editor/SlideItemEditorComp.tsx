import { lazy, useState } from 'react';

import { resizeSettingNames } from '../resize-actor/flexSizeHelpers';
import ResizeActor from '../resize-actor/ResizeActor';
import CanvasController, {
    CanvasControllerContext,
} from './canvas/CanvasController';
import { handleCtrlWheel } from '../others/AppRangeComp';
import {
    useSelectedEditingSlideItemContext,
} from '../slide-list/SlideItem';
import { MultiContextRender } from '../helper/MultiContextRender';
import CanvasItem, {
    CanvasItemsContext, checkCanvasItemsIncludes,
    EditingCanvasItemAndSetterContext, SelectedCanvasItemsAndSetterContext,
} from './canvas/CanvasItem';
import { useAppEffect } from '../helper/debuggerHelpers';
import { useFileSourceEvents } from '../helper/dirSourceHelpers';
import { defaultRangeSize } from '../bible-reader/BibleViewSetting';

const LazySlideItemEditorCanvas = lazy(() => {
    return import('./canvas/SlideItemEditorCanvasComp');
});
const LazySlideItemEditorTools = lazy(() => {
    return import('./canvas/tools/SlideItemEditorToolsComp');
});

function useCanvasController() {
    const selectedSlideItem = useSelectedEditingSlideItemContext();
    const [
        canvasController, setCanvasController,
    ] = useState(new CanvasController(selectedSlideItem));
    useAppEffect(() => {
        setCanvasController(new CanvasController(selectedSlideItem));
    }, [selectedSlideItem]);
    return canvasController;
}

function useCanvasItemsData(canvasController: CanvasController) {
    const [canvasItems, setCanvasItems] = useState(
        canvasController.canvas.newCanvasItems,
    );
    const [selectedCanvasItems, setSelectedCanvasItems] = (
        useState<CanvasItem<any>[]>([])
    );
    const [editingCanvasItem, setEditingCanvasItem] = (
        useState<CanvasItem<any> | null>(null)
    );
    const setEditingCanvasItem1 = (canvasItem: CanvasItem<any> | null) => {
        setEditingCanvasItem(canvasItem);
        if (canvasItem !== null) {
            setSelectedCanvasItems([]);
        }
    };
    const refreshData = () => {
        const newCanvasItems = canvasController.canvas.newCanvasItems;
        setCanvasItems(newCanvasItems);
        setSelectedCanvasItems((prevSelectedCanvasItems) => {
            return prevSelectedCanvasItems.filter((item) => {
                return checkCanvasItemsIncludes(newCanvasItems, item);
            });
        });
        setEditingCanvasItem((prevEditingCanvasItem) => {
            if (prevEditingCanvasItem === null) {
                return null;
            }
            return newCanvasItems.find((item) => {
                return item === prevEditingCanvasItem;
            }) || null;
        });
    };
    useAppEffect(refreshData, [canvasController]);
    const filePath = canvasController.slideItem.filePath;
    useFileSourceEvents(
        ['update'], refreshData, [], filePath,
    );
    useAppEffect(() => {
        const regEvents = canvasController.itemRegisterEventListener(
            ['update'], refreshData,
        );
        return () => {
            canvasController.unregisterEventListener(regEvents);
        };
    }, [canvasController]);
    const setSelectedCanvasItems1 = (
        newSelectedCanvasItems: CanvasItem<any>[],
    ) => {
        setSelectedCanvasItems(newSelectedCanvasItems);
        if (newSelectedCanvasItems.length > 0) {
            setEditingCanvasItem(null);
        }
    };
    return {
        canvasItems,
        selectedCanvasItems, setSelectedCanvasItems: setSelectedCanvasItems1,
        editingCanvasItem, setEditingCanvasItem: setEditingCanvasItem1,
    };
}

export default function SlideItemEditorComp() {
    const canvasController = useCanvasController();
    const {
        canvasItems, selectedCanvasItems, setSelectedCanvasItems,
        editingCanvasItem, setEditingCanvasItem,
    } = useCanvasItemsData(canvasController);
    return (
        <MultiContextRender contexts={[{
            context: CanvasControllerContext,
            value: canvasController,
        }, {
            context: CanvasItemsContext,
            value: canvasItems,
        }, {
            context: SelectedCanvasItemsAndSetterContext,
            value: {
                canvasItems: selectedCanvasItems,
                setCanvasItems: setSelectedCanvasItems,
            },
        }, {
            context: EditingCanvasItemAndSetterContext,
            value: {
                canvasItem: editingCanvasItem,
                setCanvasItem: setEditingCanvasItem,
            },
        }]}>
            <div className='slide-item-editor w-100 h-100 overflow-hidden'
                onWheel={(event) => {
                    handleCtrlWheel({
                        event, value: canvasController.scale,
                        setValue: (scale) => {
                            canvasController.scale = scale;
                        },
                        defaultSize: defaultRangeSize,
                    });
                }}>
                <ResizeActor flexSizeName={resizeSettingNames.slideItemEditor}
                    isHorizontal={false}
                    flexSizeDefault={{
                        'v1': ['3'],
                        'v2': ['1'],
                    }}
                    dataInput={[
                        {
                            children: LazySlideItemEditorCanvas, key: 'v1',
                            widgetName: 'Slide Item Editor Canvas',
                            className: 'flex-item',
                        },
                        {
                            children: LazySlideItemEditorTools, key: 'v2',
                            widgetName: 'Tools', className: 'flex-item',
                        },
                    ]} />
            </div>
        </MultiContextRender>
    );
}
