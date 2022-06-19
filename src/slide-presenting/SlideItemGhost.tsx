import './SlideItem.scss';

export default function SlideItemGhost({ width }: { width: number }) {
    return (
        <div className='slide-item' style={{
            width: `${width}px`,
            visibility: 'hidden',
        }}></div>
    );
}