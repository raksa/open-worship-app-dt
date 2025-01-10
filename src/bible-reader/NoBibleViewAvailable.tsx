import BibleItem from '../bible-list/BibleItem';
import { handleError } from '../helper/errorHelpers';
import { useBibleItemViewControllerContext } from './BibleItemViewController';

export default function NoBibleViewAvailable() {
    const viewController = useBibleItemViewControllerContext();
    return (
        <div
            className="bible-view card flex-fill"
            style={{ minWidth: '30%' }}
            onDragOver={(event) => {
                event.preventDefault();
                event.currentTarget.classList.add('receiving-child');
            }}
            onDragLeave={(event) => {
                event.preventDefault();
                event.currentTarget.classList.remove('receiving-child');
            }}
            onDrop={async (event) => {
                event.currentTarget.classList.remove('receiving-child');
                const data = event.dataTransfer.getData('text');
                try {
                    const json = JSON.parse(data);
                    if (json.type === 'bibleItem') {
                        const bibleItem = BibleItem.fromJson(json.data);
                        viewController.addBibleItem(
                            null,
                            bibleItem,
                            false,
                            false,
                        );
                    }
                } catch (error) {
                    handleError(error);
                }
            }}
        >
            '(*T) ' + 'No Bible Available'
        </div>
    );
}
