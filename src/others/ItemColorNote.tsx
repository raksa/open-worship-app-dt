import { ContextMenuItemType, showAppContextMenu } from './AppContextMenu';
import colorList from './color-list.json';
import ColorNoteInf from '../helper/ColorNoteInf';

// https://www.w3.org/wiki/CSS/Properties/color/keywords

export default function ItemColorNote({ item }: {
    item: ColorNoteInf,
}) {
    return (
        <span className={`color-note ${item.colorNote ? 'active' : ''}`}
            onClick={(event) => {
                event.stopPropagation();
                let colors = [
                    ...Object.entries(colorList.main),
                    ...Object.entries(colorList.extension),
                ];
                // unique colors by key
                colors = colors.filter((value, index, self) => {
                    return self.findIndex((v) => v[0] === value[0]) === index;
                });
                const items: ContextMenuItemType[] = [{
                    title: 'no color',
                    disabled: item.colorNote === null,
                    onClick: () => {
                        item.colorNote = null;
                    },
                }, ...colors.map(([name, colorCode]): ContextMenuItemType => {
                    return {
                        title: name,
                        disabled: item.colorNote === colorCode,
                        onClick: () => {
                            item.colorNote = colorCode;
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
                style={item.colorNote ? {
                    color: item.colorNote,
                } : {}} />
        </span>
    );
}
