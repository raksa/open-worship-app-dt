import {
    ContextMenuItemType,
    showAppContextMenu,
} from './AppContextMenu';
import colorList from './color-list.json';
import ColorNoteInf from '../helper/ColorNoteInf';
import { useMemo, useState } from 'react';
import { useAppEffect } from '../helper/debuggerHelpers';

// https://www.w3.org/wiki/CSS/Properties/color/keywords

export default function ItemColorNote({ item }: {
    item: ColorNoteInf,
}) {
    const [colorNote, _setColorNote] = useState('');
    useAppEffect(() => {
        item.getColorNote().then((colorNote) => {
            _setColorNote(colorNote ?? '');
        });
    }, [item]);
    const setColorNote = (colorNote: string | null) => {
        _setColorNote(colorNote ?? '');
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
        return reverseColorMap[colorNote ?? ''] ?? 'no color';
    }, [colorNote]);

    return (
        <span className={`color-note ${colorNote ? 'active' : ''}`}
            title={title}
            onClick={(event) => {
                event.stopPropagation();
                const colors = Object.entries({
                    ...colorList.main,
                    ...colorList.extension,
                });
                // unique colors by key
                const items: ContextMenuItemType[] = [{
                    title: 'no color',
                    disabled: colorNote === null,
                    onClick: () => {
                        setColorNote(null);
                    },
                }, ...colors.map(([name, colorCode]): ContextMenuItemType => {
                    return {
                        title: name,
                        disabled: colorNote === colorCode,
                        onClick: () => {
                            setColorNote(colorCode);
                        },
                        otherChild: (<div className='flex-fill'>
                            <i className='bi bi-record-circle float-end'
                                style={{ color: colorCode }} />
                        </div>),
                    };
                })];
                showAppContextMenu(event as any, items);
            }} >
            <i className='bi bi-record-circle'
                style={colorNote ? {
                    color: colorNote,
                } : {}} />
        </span>
    );
}
