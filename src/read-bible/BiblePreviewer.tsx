import BibleItem from '../bible-list/BibleItem';
import BibleItemViewController from './BibleItemViewController';
import BiblePreviewerRender from './BiblePreviewerRender';
import BibleView from './BibleView';

export default function BiblePreviewer() {
    const finalRenderer = (bibleItem: BibleItem, fontSize: number) => {
        return (<BibleView
            bibleItem={bibleItem}
            fontSize={fontSize}
            bibleItemViewController={bibleItemViewController}
        />);
    };
    const bibleItemViewController = new BibleItemViewController(finalRenderer);
    return (
        <BiblePreviewerRender
            bibleItemViewController={bibleItemViewController}
        />
    );
}
