import './VaryAppDocumentItem.scss';

import Slide from '../../app-document-list/Slide';
import ScreenVaryAppDocumentManager from '../../_screen/managers/ScreenVaryAppDocumentManager';
import { useScreenVaryAppDocumentManagerEvents } from '../../_screen/managers/screenEventHelpers';
import { extractDropData, handleDragStart } from '../../helper/dragHelpers';
import ShowingScreenIcon from '../../_screen/preview/ShowingScreenIcon';
import appProvider from '../../server/appProvider';
import { VaryAppDocumentItemType } from '../../app-document-list/appDocumentHelpers';
import { changeDragEventStyle, useAppPromise } from '../../helper/helpers';
import { DragTypeEnum, DroppedDataType } from '../../helper/DragInf';
import { attachBackgroundManager } from '../../others/AttachBackgroundManager';
import { ContextMenuItemType } from '../../context-menu/appContextMenuHelpers';

function RenderScreenInfoComp({
    varyAppDocumentItem,
}: Readonly<{ varyAppDocumentItem: VaryAppDocumentItemType }>) {
    if (!appProvider.isPagePresenter) {
        return null;
    }
    const { selectedList } = toClassNameHighlight(varyAppDocumentItem);
    if (selectedList.length === 0) {
        return null;
    }
    return (
        <div className="d-flex app-border-white-round px-1">
            {selectedList.map(([key]) => {
                const screenId = parseInt(key);
                return <ShowingScreenIcon key={key} screenId={screenId} />;
            })}
        </div>
    );
}

export function RenderInfoComp({
    viewIndex,
    varyAppDocumentItem,
}: Readonly<{
    viewIndex: number;
    varyAppDocumentItem: VaryAppDocumentItemType;
}>) {
    const isChanged =
        Slide.checkIsThisType(varyAppDocumentItem) &&
        (varyAppDocumentItem as Slide).isChanged;
    return (
        <div className="d-flex w-100">
            <div className="flex-fill d-flex">
                <div>
                    <span
                        className="badge rounded-pill text-bg-info"
                        title={`Index: ${viewIndex}`}
                    >
                        {viewIndex}
                    </span>
                </div>
            </div>
            <div className="flex-fill d-flex justify-content-end">
                <RenderScreenInfoComp
                    varyAppDocumentItem={varyAppDocumentItem}
                />
                <span
                    title={
                        `width:${varyAppDocumentItem.width}, ` +
                        `height:${varyAppDocumentItem.height}`
                    }
                >
                    <small className="pe-2">
                        {varyAppDocumentItem.width}x{varyAppDocumentItem.height}
                    </small>
                </span>
                {isChanged && <span style={{ color: 'red' }}>*</span>}
            </div>
        </div>
    );
}

export function toClassNameHighlight(
    varyAppDocumentItem: VaryAppDocumentItemType,
    selectedVaryAppDocumentItem?: VaryAppDocumentItemType | null,
) {
    const activeCN =
        appProvider.isPageEditor &&
        selectedVaryAppDocumentItem &&
        varyAppDocumentItem.checkIsSame(selectedVaryAppDocumentItem)
            ? 'active'
            : '';
    const selectedList = ScreenVaryAppDocumentManager.getDataList(
        varyAppDocumentItem.filePath,
        varyAppDocumentItem.id,
    );
    const presenterCN =
        appProvider.isPageEditor || selectedList.length == 0
            ? ''
            : 'highlight-selected';
    return {
        selectedList,
        activeCN,
        presenterCN,
    };
}

async function onDropHandling(
    event: React.DragEvent<HTMLDivElement>,
    item: VaryAppDocumentItemType,
) {
    event.preventDefault();
    changeDragEventStyle(event, 'opacity', '1');
    const droppedData = await extractDropData(event);
    if (
        droppedData !== null &&
        [
            DragTypeEnum.BACKGROUND_COLOR,
            DragTypeEnum.BACKGROUND_IMAGE,
            DragTypeEnum.BACKGROUND_VIDEO,
        ].includes(droppedData.type)
    ) {
        await attachBackgroundManager.attachDroppedBackground(
            droppedData,
            item.filePath,
            item.id.toString(),
        );
    }
}

function genAttachedBackgroundStyle(
    droppedData: DroppedDataType | null | undefined,
) {
    if (droppedData === null || droppedData === undefined) {
        return {};
    }
    const style: React.CSSProperties = {
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    };
    if (droppedData.type === DragTypeEnum.BACKGROUND_COLOR) {
        style.backgroundColor = droppedData.item;
    } else if (droppedData.type === DragTypeEnum.BACKGROUND_IMAGE) {
        style.backgroundImage = `url(${droppedData.item.src})`;
    } else if (droppedData.type === DragTypeEnum.BACKGROUND_VIDEO) {
        // style.backgroundImage = `url(${droppedData.item.src})`;
        // TODO: implement video background
        style.backgroundImage =
            'radial-gradient(circle at top right, #ff8a00, red, #e52e71)';
    }
    return style;
}

export default function ItemRenderComp({
    item,
    width,
    onClick,
    onContextMenu,
    onCopy,
    onDragStart,
    onDragEnd,
    selectedItem,
    children,
}: Readonly<{
    item: VaryAppDocumentItemType;
    width: number;
    index: number;
    onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
    onContextMenu: (event: any, extraMenuItems: ContextMenuItemType[]) => void;
    onCopy?: () => void;
    onDragStart: (event: React.DragEvent<HTMLDivElement>) => void;
    onDragEnd: (event: React.DragEvent<HTMLDivElement>) => void;
    selectedItem?: VaryAppDocumentItemType | null;
    children: React.ReactNode;
}>) {
    useScreenVaryAppDocumentManagerEvents(['update']);
    const { activeCN, presenterCN } = toClassNameHighlight(item, selectedItem);
    const attachedBackgroundData = useAppPromise(
        attachBackgroundManager.getAttachedBackground(
            item.filePath,
            item.id.toString(),
        ),
    );
    const attachedBackgroundStyle = genAttachedBackgroundStyle(
        attachedBackgroundData,
    );
    return (
        <div
            className={`data-vary-app-document-item card pointer ${activeCN} ${presenterCN}`}
            title={
                attachedBackgroundData?.item?.src ??
                attachedBackgroundData?.item ??
                ''
            }
            style={{ width: `${width}px`, ...attachedBackgroundStyle }}
            data-vary-app-document-item-id={item.id}
            draggable
            onDragOver={(event) => {
                event.preventDefault();
                changeDragEventStyle(event, 'opacity', '0.5');
            }}
            onDragLeave={(event) => {
                event.preventDefault();
                changeDragEventStyle(event, 'opacity', '1');
            }}
            onDrop={(event) => {
                onDropHandling(event, item);
            }}
            onDragStart={(event) => {
                handleDragStart(event, item);
                onDragStart(event);
            }}
            onDragEnd={onDragEnd}
            onClick={onClick}
            onContextMenu={(event) => {
                const menuItems: ContextMenuItemType[] = [];
                if (attachedBackgroundData) {
                    menuItems.push({
                        menuTitle: 'Remove background',
                        onSelect: () => {
                            attachBackgroundManager.detachBackground(
                                item.filePath,
                                item.id.toString(),
                            );
                        },
                    });
                }
                onContextMenu(event, menuItems);
            }}
            onCopy={onCopy ?? (() => {})}
        >
            {children}
        </div>
    );
}
