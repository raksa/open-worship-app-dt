import { previewingEventListener } from '../event/PreviewingEventListener';
import { showAppContextMenu } from '../others/AppContextMenu';
import { useTranslation } from 'react-i18next';

// https://www.w3.org/wiki/CSS/Properties/color/keywords
import colorList from '../others/color-list.json';
import Bible from './Bible';
import BibleItem from './BibleItem';

export default function BibleItemColorNote({
    bibleItem, onUpdateBiblePresent,
}: {
    bibleItem: BibleItem,
    onUpdateBiblePresent?: (newBiblePresent: BibleItem) => void,
}) {
    const { t } = useTranslation();
    let colorNote;
    if (bibleItem.metadata && bibleItem.metadata['colorNote']) {
        colorNote = bibleItem.metadata['colorNote'] as string;
    }
    return (
        <span className={`color-note ${colorNote ? 'active' : ''}`} onClick={(e) => {
            if (!onUpdateBiblePresent) {
                return;
            }
            e.stopPropagation();
            const colors = [
                ...Object.entries(colorList.main),
                ...Object.entries(colorList.extension),
            ];
            showAppContextMenu(e, [{
                title: t('no color'),
                onClick: () => {
                    bibleItem.metadata = bibleItem.metadata || {};
                    delete bibleItem.metadata['colorNote'];
                },
            }, ...colors.map(([name, colorCode]) => {
                return {
                    title: name,
                    onClick: () => {
                        bibleItem.metadata = bibleItem.metadata || {};
                        bibleItem.metadata['colorNote'] = colorCode;
                        onUpdateBiblePresent(bibleItem);
                    },
                    otherChild: (<span style={{ float: 'right' }}>
                        <i className='bi bi-record-circle' style={{ color: colorCode }} />
                    </span>),
                };
            })]);
        }} >
            <i className='bi bi-record-circle'
                style={colorNote ? { color: colorNote } : {}} />
        </span>
    );
}
