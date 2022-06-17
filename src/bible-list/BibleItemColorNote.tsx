import { previewingEventListener } from '../event/PreviewingEventListener';
import {
    getBiblePresentingSetting,
    setBiblePresentingSetting,
} from '../helper/settingHelper';
import { BiblePresentType } from '../full-text-present/previewingHelper';
import { convertPresent } from '../full-text-present/FullTextPresentController';
import { showAppContextMenu } from '../others/AppContextMenu';
import { useTranslation } from 'react-i18next';

// https://www.w3.org/wiki/CSS/Properties/color/keywords
import colorList from '../others/color-list.json';

export function presentBible(item: BiblePresentType) {
    setBiblePresentingSetting(convertPresent(item, getBiblePresentingSetting()));
    previewingEventListener.presentBible(item);
}

export default function BibleItemColorNote({ biblePresent, onUpdateBiblePresent }: {
    biblePresent: BiblePresentType,
    onUpdateBiblePresent?: (newBiblePresent: BiblePresentType) => void,
}) {
    const { t } = useTranslation();
    let colorNote;
    if (biblePresent.metadata && biblePresent.metadata['colorNote']) {
        colorNote = biblePresent.metadata['colorNote'] as string;
    }
    return (
        <span className={`color-note ${colorNote ? 'active' : ''}`} onClick={(e) => {
            if (!onUpdateBiblePresent) {
                return;
            }
            e.stopPropagation();
            const colors = [...Object.entries(colorList.main), ...Object.entries(colorList.extension)];
            showAppContextMenu(e, [{
                title: t('no color'),
                onClick: () => {
                    biblePresent.metadata = biblePresent.metadata || {};
                    delete biblePresent.metadata['colorNote'];
                },
            }, ...colors.map(([name, colorCode]) => {
                return {
                    title: name,
                    onClick: () => {
                        biblePresent.metadata = biblePresent.metadata || {};
                        biblePresent.metadata['colorNote'] = colorCode;
                        onUpdateBiblePresent(biblePresent);
                    },
                    otherChild: (<span style={{ float: 'right' }}>
                        <i className='bi bi-record-circle' style={{ color: colorCode }} />
                    </span>),
                };
            })]);
        }} >
            <i className='bi bi-record-circle' style={colorNote ? { color: colorNote } : {}} />
        </span>
    );
}
