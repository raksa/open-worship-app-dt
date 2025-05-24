import Slide from '../../app-document-list/Slide';
import SlideRendererHtmlComp from './SlideRendererHtmlComp';
import { useScreenVaryAppDocumentManagerEvents } from '../../_screen/managers/screenEventHelpers';
import { handleDragStart } from '../../helper/dragHelpers';
import { use } from 'react';
import { SelectedEditingSlideContext } from '../../app-document-list/appDocumentHelpers';
import SlideItemRenderComp from './SlideItemRenderComp';
import { ContextMenuItemType } from '../../context-menu/appContextMenuHelpers';

export default function SlideRenderComp({
    slide,
    width,
    index,
    onClick,
    onContextMenu,
    onCopy,
    onDragStart,
    onDragEnd,
}: Readonly<{
    slide: Slide;
    width: number;
    index: number;
    onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
    onContextMenu: (event: any, extraMenuItems: ContextMenuItemType[]) => void;
    onCopy: () => void;
    onDragStart: (event: React.DragEvent<HTMLDivElement>) => void;
    onDragEnd: (event: React.DragEvent<HTMLDivElement>) => void;
}>) {
    const selectedSlide =
        use(SelectedEditingSlideContext)?.selectedSlide ?? null;
    useScreenVaryAppDocumentManagerEvents(['update']);
    const dragStartHandling = (event: any) => {
        handleDragStart(event, slide);
        onDragStart(event);
    };
    const dragEndHandling = (event: any) => {
        onDragEnd(event);
    };
    return (
        <SlideItemRenderComp
            item={slide}
            selectedItem={selectedSlide}
            width={width}
            index={index}
            onDragStart={dragStartHandling}
            onDragEnd={dragEndHandling}
            onContextMenu={onContextMenu}
            onClick={onClick}
            onCopy={onCopy}
        >
            <SlideRendererHtmlComp slide={slide} width={width} />
        </SlideItemRenderComp>
    );
}
