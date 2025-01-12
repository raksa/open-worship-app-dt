import { lazy, useState } from 'react';

import { resizeSettingNames } from '../resize-actor/flexSizeHelpers';
import ResizeActor from '../resize-actor/ResizeActor';
import CanvasController, {
    CanvasControllerContext,
    defaultRangeSize,
} from './canvas/CanvasController';
import { handleCtrlWheel } from '../others/AppRangeComp';
import { MultiContextRender } from '../helper/MultiContextRender';
import CanvasItem, {
    CanvasItemsContext,
    checkCanvasItemsIncludes,
    EditingCanvasItemAndSetterContext,
    SelectedCanvasItemsAndSetterContext,
} from './canvas/CanvasItem';
import { useAppEffect } from '../helper/debuggerHelpers';
import { useFileSourceEvents } from '../helper/dirSourceHelpers';
import { useSelectedEditingSlideContext } from '../app-document-list/appDocumentHelpers';

const LazySlideEditorCanvas = lazy(() => {
    return import('./canvas/SlideEditorCanvasComp');
});
const LazySlideEditorTools = lazy(() => {
    return import('./canvas/tools/SlideEditorToolsComp');
});

function useCanvasController() {
    const selectedVaryAppDocumentItem = useSelectedEditingSlideContext();
    const [canvasController, setCanvasController] = useState(
        new CanvasController(selectedVaryAppDocumentItem),
    );
    useAppEffect(() => {
        setCanvasController(new CanvasController(selectedVaryAppDocumentItem));
    }, [selectedVaryAppDocumentItem]);
    return canvasController;
}

function useCanvasItemsData(canvasController: CanvasController) {
    const [canvasItems, setCanvasItems] = useState(
        canvasController.canvas.newCanvasItems,
    );
    const [selectedCanvasItems, setSelectedCanvasItems] = useState<
        CanvasItem<any>[]
    >([]);
    const [editingCanvasItem, setEditingCanvasItem] =
        useState<CanvasItem<any> | null>(null);
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
            return (
                newCanvasItems.find((item) => {
                    return item === prevEditingCanvasItem;
                }) ?? null
            );
        });
    };
    useAppEffect(refreshData, [canvasController]);
    const filePath = canvasController.slide.filePath;
    useFileSourceEvents(['update'], refreshData, [], filePath);
    useAppEffect(() => {
        const regEvents = canvasController.itemRegisterEventListener(
            ['update'],
            refreshData,
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
        selectedCanvasItems,
        setSelectedCanvasItems: setSelectedCanvasItems1,
        editingCanvasItem,
        setEditingCanvasItem: setEditingCanvasItem1,
    };
}

export default function SlideEditorComp() {
    const canvasController = useCanvasController();
    const {
        canvasItems,
        selectedCanvasItems,
        setSelectedCanvasItems,
        editingCanvasItem,
        setEditingCanvasItem,
    } = useCanvasItemsData(canvasController);
    return (
        <MultiContextRender
            contexts={[
                {
                    context: CanvasControllerContext,
                    value: canvasController,
                },
                {
                    context: CanvasItemsContext,
                    value: canvasItems,
                },
                {
                    context: SelectedCanvasItemsAndSetterContext,
                    value: {
                        canvasItems: selectedCanvasItems,
                        setCanvasItems: setSelectedCanvasItems,
                    },
                },
                {
                    context: EditingCanvasItemAndSetterContext,
                    value: {
                        canvasItem: editingCanvasItem,
                        setCanvasItem: setEditingCanvasItem,
                    },
                },
            ]}
        >
            <div
                className="slide-editor w-100 h-100 overflow-hidden"
                onWheel={(event) => {
                    event.stopPropagation();
                    handleCtrlWheel({
                        event,
                        value: canvasController.scale * 10,
                        setValue: (scale) => {
                            canvasController.scale = scale / 10;
                        },
                        defaultSize: defaultRangeSize,
                    });
                }}
            >
                <ResizeActor
                    flexSizeName={resizeSettingNames.slideEditor}
                    isHorizontal={false}
                    flexSizeDefault={{
                        v1: ['3'],
                        v2: ['1'],
                    }}
                    dataInput={[
                        {
                            children: LazySlideEditorCanvas,
                            key: 'v1',
                            widgetName: 'Slide Editor Canvas',
                            className: 'flex-item',
                        },
                        {
                            children: LazySlideEditorTools,
                            key: 'v2',
                            widgetName: 'Tools',
                            className: 'flex-item',
                        },
                    ]}
                />
            </div>
        </MultiContextRender>
    );
}
