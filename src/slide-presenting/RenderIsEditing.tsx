import SlideItem from './SlideItem';
import { useEffect, useState } from 'react';

export default function RenderIsEditing({ slideItem, index }: {
    index: number, slideItem: SlideItem,
}) {
    const [isEditing, setIsEditing] = useState(false);
    useEffect(() => {
        slideItem.isEditing(index).then(setIsEditing);
    }, [slideItem]);
    if (!isEditing) {
        return null;
    }
    return (
        <span style={{ color: 'red' }}>*</span>
    );
}
