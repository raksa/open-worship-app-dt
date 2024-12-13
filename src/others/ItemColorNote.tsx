import { useMemo, useState } from 'react';

import {
    ContextMenuItemType, showAppContextMenu,
} from './AppContextMenu';
import colorList from './color-list.json';
import ColorNoteInf from '../helper/ColorNoteInf';
import { useAppEffect } from '../helper/debuggerHelpers';

// https://www.w3.org/wiki/CSS/Properties/color/keywords

export default function ItemColorNote({ item }: Readonly<{
    item: ColorNoteInf,
}>) {
    const [colorNote, setColorNote] = useState('');
    useAppEffect(() => {
        item.getColorNote().then((colorNote) => {
            setColorNote(colorNote || '');
        });
    }, [item]);
    const setColorNote1 = (colorNote: string | null) => {
        setColorNote(colorNote || '');
        item.setColorNote(colorNote);
    };
    const title = useMemo(() => {
        const reverseColorMap: Record<string, string> =
            Object.entries({
                ...colorList.main,
                ...colorList.extension,
            }).reduce((acc, [name, colorCode]) => {
                acc[colorCode] = name;
                return acc;
            }, {} as Record<string, string>);
        return reverseColorMap[colorNote] || 'no color';
    }, [colorNote]);
    const handleColorSelecting = (event: any) => {
        event.stopPropagation();
        const colors = Object.entries({
            ...colorList.main,
            ...colorList.extension,
        });
        // unique colors by key
        const items: ContextMenuItemType[] = [
            {
                menuTitle: 'no color',
                disabled: colorNote === null,
                onClick: () => {
                    setColorNote1(null);
                },
            },
            ...colors.map(([name, colorCode]): ContextMenuItemType => {
                return {
                    menuTitle: name,
                    disabled: colorNote === colorCode,
                    onClick: () => {
                        setColorNote1(colorCode);
                    },
                    otherChild: (
                        <div className='flex-fill'>
                            <i className='bi bi-record-circle float-end'
                                style={{ color: colorCode }}
                            />
                        </div>
                    ),
                };
            })];
        showAppContextMenu(event, items);
    };

    return (
        <span className={`color-note pointer ${colorNote ? 'active' : ''}`}
            title={title}
            onClick={handleColorSelecting} >
            <i className='bi bi-record-circle'
                style={colorNote ? {
                    color: colorNote,
                } : {}}
            />
        </span>
    );
}
