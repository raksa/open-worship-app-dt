import HTML2React from '../slide-editor/HTML2React';

export default function SlideItemIFrame({
    id, width, html2React,
}: { id: number, width: number, html2React: HTML2React }) {
    const height = width * html2React.height / html2React.width;
    const scaleX = width / html2React.width;
    const scaleY = height / html2React.height;
    return (
        <div style={{
            width, height,
            transform: `scale(${scaleX},${scaleY}) translate(50%, 50%)`,
        }}>
            <iframe title={id + ''}
                frameBorder="0"
                style={{
                    pointerEvents: 'none',
                    borderStyle: 'none',
                    width: `${html2React.width}px`,
                    height: `${html2React.height}px`,
                    transform: 'translate(-50%, -50%)',
                }}
                srcDoc={`<style>html,body {overflow: hidden;}</style>${html2React.htmlString}`}
            />
        </div>
    );
}
