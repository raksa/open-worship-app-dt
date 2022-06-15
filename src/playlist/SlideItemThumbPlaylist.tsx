import { extractSlideItemThumbSelected } from '../helper/helpers';
import { slideListEventListenerGlobal } from '../event/SlideListEventListener';
import { getSlideDataByFilePath, HTML2React, SlidePresentType } from '../helper/slideHelper';
import { SlideItemThumbIFrame } from '../slide-presenting/SlideItemThumbIFrame';
import { useEffect, useState } from 'react';

export default function SlideItemThumbPlaylist({
    slideItemThumbPath, width,
}: {
    slideItemThumbPath: string, width: number,
}) {
    const { id, slideFilePath } = extractSlideItemThumbSelected(slideItemThumbPath);
    const [slideData, setSlideData] = useState<SlidePresentType | null>(null);
    useEffect(() => {
        getSlideDataByFilePath(slideFilePath).then((data1) => {
            setSlideData(data1);
        });
    }, [slideFilePath]);
    const item = slideData === null ? null : (slideData.items.find((newItem) => newItem.id === id) || null);
    if (item === null) {
        return (
            <div className='card' style={{ width }}>Not Found</div>
        );
    }
    return (
        <div className='card overflow-hidden'
            onClick={() => {
                slideListEventListenerGlobal.selectSlideItemThumb(item);
            }}>
            <SlideItemThumbIFrame id={id} width={width}
                html2React={HTML2React.parseHTML(item.html)} />
        </div>
    );
}
