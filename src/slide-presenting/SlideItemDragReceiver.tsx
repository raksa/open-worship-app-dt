import './SlideItemDragReceiver.scss';

import SlideItem from './SlideItem';

export default function SlideItemDragReceiver({ onDrop }: {
    onDrop: (id: number) => void,
}) {
    return (
        <div className='slide-item-drag-receiver'
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
                const result = SlideItem.extractItemSetting(path);
                if(result!== null) {
                    onDrop(result.id);
                }
            }}></div>
    );
}
