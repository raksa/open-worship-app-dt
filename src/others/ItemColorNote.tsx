import { showAppContextMenu } from './AppContextMenu';
import colorList from './color-list.json';
import ColorNoteInf from '../helper/ColorNoteInf';

// https://www.w3.org/wiki/CSS/Properties/color/keywords

export default function ItemColorNote({ item }: {
    item: ColorNoteInf,
}) {
    return (
        <span className={`color-note ${item.colorNote ? 'active' : ''}`} onClick={(event) => {
            event.stopPropagation();
            const colors = [
                ...Object.entries(colorList.main),
                ...Object.entries(colorList.extension),
            ];
            showAppContextMenu(event as any, [{
                title: 'no color',
                onClick: () => {
                    item.colorNote = null;
                },
            }, ...colors.map(([name, colorCode]) => {
                return {
                    title: name,
                    onClick: () => {
                        item.colorNote = colorCode;
                    },
                    otherChild: (<span style={{ float: 'right' }}>
                        <i className='bi bi-record-circle' style={{ color: colorCode }} />
                    </span>),
                };
            })]);
        }} >
            <i className='bi bi-record-circle'
                style={item.colorNote ? { color: item.colorNote } : {}} />
        </span>
    );
}
