import BibleView, { RESIZER_SETTING_NAME } from './BibleView';
import BibleItem from '../bible-list/BibleItem';
import { handleError } from '../helper/errorHelpers';
import BibleItemViewController, {
    useBIVCUpdateEvent,
} from './BibleItemViewController';
import ResizeActor from '../resize-actor/ResizeActor';
import { clearFlexSizeSetting } from '../resize-actor/flexSizeHelpers';

export default function BibleViewRenderer({
    fontSize, bibleItemViewController,
}: {
    fontSize: number,
    bibleItemViewController: BibleItemViewController,
}) {
    const bibleItems = useBIVCUpdateEvent(bibleItemViewController);
    if (bibleItems.length === 0) {
        return <NoBibleViewAvailable
            bibleItemViewController={bibleItemViewController} />;
    }
    if (bibleItems.length === 1) {
        return (
            <BibleView index={0}
                bibleItem={bibleItems[0]}
                fontSize={fontSize}
                bibleItemViewController={bibleItemViewController}
            />
        );
    }
    return (
        <ResizeActor
            fSizeName={RESIZER_SETTING_NAME}
            flexSizeDefault={Object.fromEntries(bibleItems.map((_, i) => {
                return [`h${i + 1}`, ['1']];
            }))}
            resizeKinds={['h']}
            dataInput={bibleItems.map((bibleItem, i) => {
                return [{
                    render: () => {
                        return <BibleView index={i}
                            bibleItem={bibleItem}
                            fontSize={fontSize}
                            bibleItemViewController={bibleItemViewController}
                        />;
                    },
                }, `h${i + 1}`, 'flex-item'];
            })} />
    );
}

function NoBibleViewAvailable({ bibleItemViewController }: {
    bibleItemViewController: BibleItemViewController,
}) {
    return (
        <div className='bible-view card flex-fill'
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
                        clearFlexSizeSetting(RESIZER_SETTING_NAME);
                        const bibleItem = BibleItem.fromJson(json.data);
                        bibleItemViewController.addItem(bibleItem);
                    }
                } catch (error) {
                    handleError(error);
                }
            }}>
            '(*T) ' + 'No Bible Available'
        </div>
    );
}
