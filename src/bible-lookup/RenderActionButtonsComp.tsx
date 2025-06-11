import { saveBibleItem } from '../bible-list/bibleHelpers';
import BibleItem from '../bible-list/BibleItem';
import { useBibleItemsViewControllerContext } from '../bible-reader/BibleItemsViewController';

export default function RenderActionButtonsComp({
    bibleItem,
}: Readonly<{ bibleItem: BibleItem }>) {
    const viewController = useBibleItemsViewControllerContext();
    return (
        <div className="btn-group mx-1">
            <button
                type="button"
                className="btn btn-sm btn-info"
                title={'Split horizontal'}
                onClick={() => {
                    viewController.addBibleItemLeft(bibleItem, bibleItem);
                }}
            >
                <i className="bi bi-vr" />
            </button>
            <button
                type="button"
                className="btn btn-sm btn-info"
                title={'Split vertical'}
                onClick={() => {
                    viewController.addBibleItemBottom(bibleItem, bibleItem);
                }}
            >
                <i className="bi bi-hr" />
            </button>
            <button
                type="button"
                className="btn btn-sm btn-info"
                title={'Save bible item'}
                onClick={() => {
                    saveBibleItem(bibleItem);
                }}
            >
                <i className="bi bi-floppy" />
            </button>
        </div>
    );
}
