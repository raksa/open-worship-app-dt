import BibleItem from '../bible-list/BibleItem';
import {
    useBibleItemRenderText,
    useBibleItemToInputText,
} from '../helper/bible-helpers/bibleRenderHelpers';

export default function SettingAbout() {
    const bookKey = 'PSA';
    const text = useBibleItemRenderText(BibleItem.fromJson({
        id: -1,
        bibleKey: 'KJV',
        target: {
            book: bookKey, chapter: 150,
            startVerse: 6,
            endVerse: 6,
        },
        metadata: {},
    }));
    const title = useBibleItemToInputText('KJV', bookKey, 150, 6, 6);
    const onClick = () => {
        const url = 'https://github.com/OpenWorshipApp/open-worship-app-dt';
        window.open(url, '_blank');
    };
    return (
        <div>
            <div className='card border-success mb-3 mx-auto mt-5'
                style={{
                    maxWidth: '400px',
                    maxHeight: '275px',
                }}>
                <div className='card-header bg-transparent border-success'>
                    KJV|{title}
                </div>
                <div className={'card-body bg-transparent '
                    + 'border-success selectable-text'}>
                    {text}
                </div>
            </div>
            <div className='alert alert-info'>
                <span title='Need translation'>(*T)</span>
                This is an open-source presentation app for worship service.
                Official Github repo here: <button className='btn btn-success'
                    onClick={onClick}
                >https://github.com/OpenWorshipApp/open-worship-app-dt</button>
            </div>
        </div>
    );
}
