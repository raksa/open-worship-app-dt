import './VaryAppDocumentItem.scss';

import Slide from '../../app-document-list/Slide';
import ScreenVaryAppDocumentManager from '../../_screen/managers/ScreenVaryAppDocumentManager';
import { useScreenVaryAppDocumentManagerEvents } from '../../_screen/managers/screenEventHelpers';
import {
    genRemovingAttachedBackgroundMenu,
    handleDragStart,
    onDropHandling,
    useAttachedBackgroundData,
} from '../../helper/dragHelpers';
import ShowingScreenIcon from '../../_screen/preview/ShowingScreenIcon';
import appProvider from '../../server/appProvider';
import { VaryAppDocumentItemType } from '../../app-document-list/appDocumentHelpers';
import { changeDragEventStyle } from '../../helper/helpers';
import { DragTypeEnum, DroppedDataType } from '../../helper/DragInf';
import { ContextMenuItemType } from '../../context-menu/appContextMenuHelpers';
import { useMemo, useState } from 'react';
import { useAppEffect } from '../../helper/debuggerHelpers';

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

function RenderInfoComp({
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

function RenderHeaderInfoComp({
    item,
    viewIndex,
}: Readonly<{ item: VaryAppDocumentItemType; viewIndex: number }>) {
    return (
        <div
            className="card-header d-flex"
            style={{
                height: '35px',
                backgroundColor: 'var(--bs-gray-800)',
            }}
        >
            <RenderInfoComp viewIndex={viewIndex} varyAppDocumentItem={item} />
        </div>
    );
}

export function toClassNameHighlight(
    varyAppDocumentItem: VaryAppDocumentItemType,
    selectedVaryAppDocumentItem?: VaryAppDocumentItemType | null,
) {
    const activeClassname =
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
            : 'app-highlight-selected';
    return {
        selectedList,
        activeCN: activeClassname,
        presenterCN,
    };
}

function genAttachBackgroundComponent(
    droppedData: DroppedDataType | null | undefined,
) {
    if (droppedData === null || droppedData === undefined) {
        return null;
    }
    let element = null;
    if (droppedData.type === DragTypeEnum.BACKGROUND_COLOR) {
        element = (
            <div
                className="w-100 h-100"
                style={{ backgroundColor: droppedData.item }}
            />
        );
    } else if (droppedData.type === DragTypeEnum.BACKGROUND_IMAGE) {
        element = (
            <img
                className="w-100 h-100"
                alt={droppedData.item.src}
                src={droppedData.item.src}
            />
        );
    } else if (droppedData.type === DragTypeEnum.BACKGROUND_VIDEO) {
        element = (
            <video
                className="w-100 h-100"
                onMouseEnter={(event) => {
                    event.currentTarget.play();
                }}
                onMouseLeave={(event) => {
                    event.currentTarget.pause();
                    event.currentTarget.currentTime = 0;
                }}
                loop
                muted
                src={droppedData.item.src}
            />
        );
    }
    return element;
}

export function useScale(item: VaryAppDocumentItemType, thumbnailSize: number) {
    const [targetDiv, setTargetDiv] = useState<HTMLDivElement | null>(null);
    const [parentWidth, setParentWidth] = useState(0);
    useAppEffect(() => {
        setParentWidth(targetDiv?.clientWidth ?? 0);
    }, [targetDiv, thumbnailSize]);
    const scale = useMemo(() => {
        return parentWidth / item.width;
    }, [parentWidth, item]);
    return {
        parentWidth,
        scale,
        setTargetDiv,
        setParentDiv: (div: HTMLDivElement | null) => {
            if (div === null) {
                setTargetDiv(null);
            } else {
                setTargetDiv(div.parentElement as HTMLDivElement);
            }
        },
    };
}

export default function SlideItemRenderComp({
    item,
    width,
    index,
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
    const { scale, setTargetDiv } = useScale(item, width);
    useScreenVaryAppDocumentManagerEvents(['update']);
    const { activeCN, presenterCN } = toClassNameHighlight(item, selectedItem);
    const attachedBackgroundData = useAttachedBackgroundData(
        item.filePath,
        item.id.toString(),
    );
    const attachedBackgroundElement = useMemo(() => {
        return genAttachBackgroundComponent(attachedBackgroundData);
    }, [attachedBackgroundData]);
    const style: React.CSSProperties = {
        padding: 0,
        margin: 0,
        height: `${item.height * scale}px`,
    };
    return (
        <div
            className={
                'data-vary-app-document-item card' +
                ` app-caught-hover-pointer ${activeCN} ${presenterCN}`
            }
            ref={setTargetDiv}
            style={{ width: `${width}px` }}
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
                    menuItems.push(
                        ...genRemovingAttachedBackgroundMenu(
                            item.filePath,
                            item.id.toString(),
                        ),
                    );
                }
                onContextMenu(event, menuItems);
            }}
            onCopy={onCopy ?? (() => {})}
        >
            <RenderHeaderInfoComp item={item} viewIndex={index + 1} />
            <div className="card-body overflow-hidden w-100" style={style}>
                {attachedBackgroundElement && (
                    <div
                        className="w-100"
                        style={{
                            ...style,
                            position: 'absolute',
                        }}
                    >
                        {attachedBackgroundElement}
                    </div>
                )}
                <div
                    className="w-100"
                    style={{
                        ...style,
                        position: 'absolute',
                        pointerEvents: 'none',
                    }}
                >
                    {children}
                </div>
            </div>
        </div>
    );
}
