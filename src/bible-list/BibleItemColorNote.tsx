import { showAppContextMenu } from '../others/AppContextMenu';
import { useTranslation } from 'react-i18next';
import colorList from '../others/color-list.json';
import ColorNorteInf from '../helper/ColorNorteInf';

// https://www.w3.org/wiki/CSS/Properties/color/keywords

export default function BibleItemColorNote({ item }: {
    item: ColorNorteInf,
}) {
    const { t } = useTranslation();
    return (
        <span className={`color-note ${item.colorNote ? 'active' : ''}`} onClick={(e) => {
            e.stopPropagation();
            const colors = [
                ...Object.entries(colorList.main),
                ...Object.entries(colorList.extension),
            ];
            showAppContextMenu(e, [{
                title: t('no color'),
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
