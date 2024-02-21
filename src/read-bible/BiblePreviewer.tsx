import BibleItem from '../bible-list/BibleItem';
import BibleItemViewController from './BibleItemViewController';
import BiblePreviewerRender from './BiblePreviewerRender';
import BibleView from './BibleView';

function finalRenderer(bibleItem: BibleItem) {
    return (<BibleView
        bibleItem={bibleItem}
        bibleItemViewController={bibleItemViewController}
    />);
}
const bibleItemViewController = new BibleItemViewController(finalRenderer);
export default function BiblePreviewer() {
    return (
        <BiblePreviewerRender
            bibleItemViewController={bibleItemViewController}
        />
    );
}
