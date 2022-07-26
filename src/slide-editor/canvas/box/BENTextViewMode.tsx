import { CSSProperties } from 'react';
import {
    showCanvasItemContextMenu,
} from '../canvasHelpers';
import CanvasItemText from '../CanvasItemText';
import reactDOMServer from 'react-dom/server';
import { getAppInfo } from '../../../helper/helpers';

export default function BENTextViewMode({
    canvasItemText, style,
}: {
    canvasItemText: CanvasItemText,
    style: CSSProperties
}) {
    return (
        <div className='box-editor pointer'
            style={style}
            onContextMenu={async (e) => {
                e.stopPropagation();
                showCanvasItemContextMenu(e, canvasItemText);
            }}
            onClick={async (e) => {
                e.stopPropagation();
                canvasItemText.canvasController?.stopAllMods();
                canvasItemText.isSelected = true;
            }}>
            <BENTextRender canvasItemText={canvasItemText} />
        </div>
    );
}

export function BENTextRender({ canvasItemText }: {
    canvasItemText: CanvasItemText,
}) {
    return (
        <div className='w-100 h-100'
            style={canvasItemText.getStyle()}
            dangerouslySetInnerHTML={{
                __html: canvasItemText.html.innerHTML,
            }} />
    );
}

export function genTextDefaultBoxStyle(width: number = 700,
    height: number = 400): CSSProperties {
    return {
        position: 'absolute',
        top: '279px',
        left: '356px',
        transform: 'rotate(0deg)',
        zIndex: '2',
        backgroundColor: 'rgba(255, 0, 255, 0.39)',
        width: `${width}px`,
        height: `${height}px`,
    };
}
export function genTextDefaultHtmlString(width?: number, height?: number) {
    return reactDOMServer.renderToString(<div
        id='0'
        style={{
            ...genTextDefaultBoxStyle(width, height),
            display: 'flex',
            fontSize: '60px',
            color: 'rgb(255, 254, 254)',
            alignItems: 'center',
            justifyContent: 'center',
        }}>{getAppInfo().name}</div>);
}
