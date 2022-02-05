import './SlideItemThumb.scss';

import { SlideItemThumbType } from '../editor/slideType';
import { parseHTML } from '../editor/slideParser';
import { ContextMenuEventType } from '../others/AppContextMenu';
import { extractSlideItemThumbSelected, toSlideItemThumbSelected } from '../helper/helpers';

export function SlideItemThumbIFrame({
    id, width, html,
}: { id: string, width: number, html: string }) {
    const parsedHTMLData = parseHTML(html);
    const height = width * parsedHTMLData.height / parsedHTMLData.width;
    const scaleX = width / parsedHTMLData.width;
    const scaleY = height / parsedHTMLData.height;
    return (
        <div style={{
            width, height,
            transform: `scale(${scaleX},${scaleY}) translate(50%, 50%)`,
        }}>
            <iframe title={id}
                frameBorder="0"
                style={{
                    pointerEvents: 'none',
                    borderStyle: 'none',
                    width: `${parsedHTMLData.width}px`,
                    height: `${parsedHTMLData.height}px`,
                    transform: 'translate(-50%, -50%)',
                }}
                srcDoc={`<style>html,body {overflow: hidden;}</style>${html}`}
            />
        </div>
    );
}

type SlideItemThumbnailProps = {
    width: number,
    index: number;
    isActive: boolean;
    data: SlideItemThumbType;
    onItemClick: () => void,
    onContextMenu: (e: ContextMenuEventType) => void,
    onCopy: () => void,
    onDragStart: (e: React.DragEvent<HTMLDivElement>) => void,
    onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void,
};
export default function SlideItemThumb({
    width,
    isActive, index, data,
    onItemClick,
    onContextMenu,
    onCopy,
    onDragStart,
    onDragEnd,
}: SlideItemThumbnailProps) {
    return (
        <div className={`slide-item-thumb card ${isActive ? 'active' : ''} pointer`}
            draggable
            onDragStart={(e) => {
                const path = toSlideItemThumbSelected(data.slideFilePath, data.id) || '';
                e.dataTransfer.setData('text/plain', path);
                onDragStart(e);
            }}
            onDragEnd={(e) => {
                onDragEnd(e);
            }}
            style={{
                width: `${width}px`,
            }}
            onClick={() => {
                onItemClick();
            }}
            onContextMenu={(e) => onContextMenu(e)}
            onCopy={onCopy}>
            <div className="card-header">
                {index + 1} {isActive && <span><i className="bi bi-collection" /></span>}
                {data.isEditing && <span className='float-end' style={{
                    color: 'red',
                }}>*</span>}
            </div>
            <div className="card-body overflow-hidden"
                style={{ width }} >
                <SlideItemThumbIFrame id={data.id} width={width} html={data.html} />
            </div>
        </div>
    );
}
export function DragReceiver({ onDrop }: {
    onDrop: (id: string) => void,
}) {
    return (
        <div className='slide-item-thumb-drag-receiver'
            onDragOver={(event) => {
                event.preventDefault();
                (event.currentTarget as HTMLDivElement).style.opacity = '0.5';
            }}
            onDragLeave={(event) => {
                event.preventDefault();
                (event.currentTarget as HTMLDivElement).style.opacity = '0.1';
            }}
            onDrop={(event) => {
                const path = event.dataTransfer.getData('text');
                const result = extractSlideItemThumbSelected(path);
                onDrop(result.id);
            }}></div>
    );
}
export function ItemThumbGhost({ width }: { width: number }) {
    return (
        <div className='slide-item-thumb' style={{
            width: `${width}px`,
            visibility: 'hidden',
        }}></div>
    );
}
