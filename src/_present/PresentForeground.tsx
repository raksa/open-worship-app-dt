import './PresentForeground.scss';

export default function PresentForeground() {
    return (
        <div id="foreground"
            style={{
                pointerEvents: 'none',
                position: 'absolute',
                width: '100%',
                height: '100%',
                overflow: 'hidden',
            }}>FG</div>
    );
}
