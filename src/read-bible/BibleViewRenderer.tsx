import BibleView from './BibleView';
import BibleItemViewController, {
    RESIZE_SETTING_NAME, useBIVCUpdateEvent,
} from './BibleItemViewController';
import ResizeActor from '../resize-actor/ResizeActor';
import NoBibleViewAvailable from './NoBibleViewAvailable';

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
            fSizeName={RESIZE_SETTING_NAME}
            flexSizeDefault={Object.fromEntries(bibleItems.map((_, i) => {
                return [`h${i + 1}`, ['1']];
            }))}
            resizeKinds={Array.from({
                length: bibleItems.length - 1,
            }).map(() => 'h')}
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
