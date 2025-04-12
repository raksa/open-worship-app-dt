import './VaryAppDocumentItem.scss';

import Slide from '../../app-document-list/Slide';
import ScreenVaryAppDocumentManager from '../../_screen/managers/ScreenVaryAppDocumentManager';
import { useScreenVaryAppDocumentManagerEvents } from '../../_screen/managers/screenEventHelpers';
import { handleDragStart } from '../../helper/dragHelpers';
import ShowingScreenIcon from '../../_screen/preview/ShowingScreenIcon';
import appProvider from '../../server/appProvider';
import { VaryAppDocumentItemType } from '../../app-document-list/appDocumentHelpers';

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
    onContextMenu: (event: any) => void;
    onCopy?: () => void;
    onDragStart: (event: React.DragEvent<HTMLDivElement>) => void;
    onDragEnd: (event: React.DragEvent<HTMLDivElement>) => void;
    selectedItem?: VaryAppDocumentItemType | null;
    children: React.ReactNode;
}>) {
    useScreenVaryAppDocumentManagerEvents(['update']);
    const { activeCN, presenterCN } = toClassNameHighlight(item, selectedItem);
    const dragStartHandling = (event: any) => {
        handleDragStart(event, item);
        onDragStart(event);
    };
    const dragEndHandling = (event: any) => {
        onDragEnd(event);
    };
    return (
        <div
            className={`data-vary-app-document-item card pointer ${activeCN} ${presenterCN}`}
            style={{ width: `${width}px` }}
            data-vary-app-document-item-id={item.id}
            draggable
            onDragStart={dragStartHandling}
            onDragEnd={dragEndHandling}
            onClick={onClick}
            onContextMenu={onContextMenu}
            onCopy={onCopy ?? (() => {})}
        >
            {children}
        </div>
    );
}
