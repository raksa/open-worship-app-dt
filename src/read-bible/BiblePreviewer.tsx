import BibleItem from '../bible-list/BibleItem';
import BibleItemViewController, {
    BibleItemViewControllerContext,
} from './BibleItemViewController';
import BiblePreviewerRender from './BiblePreviewerRender';
import BibleView from './BibleView';

function finalRenderer(bibleItem: BibleItem) {
    return (<BibleView
        bibleItem={bibleItem}
    />);
}
const bibleItemViewController = new BibleItemViewController(finalRenderer);
export default function BiblePreviewer() {
    return (
        <BibleItemViewControllerContext.Provider
            value={bibleItemViewController}>
            <BiblePreviewerRender />
        </BibleItemViewControllerContext.Provider>
    );
}
