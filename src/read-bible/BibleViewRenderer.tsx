import BibleView from './BibleView';
import BibleItemViewController, {
    RESIZE_SETTING_NAME,
} from './BibleItemViewController';
import ResizeActor from '../resize-actor/ResizeActor';
import NoBibleViewAvailable from './NoBibleViewAvailable';
import BibleItem from '../bible-list/BibleItem';

export default function BibleViewRenderer({
    fontSize, bibleItemViewController, isHorizontal, bibleItems,
    indices,
}: {
    fontSize: number,
    bibleItemViewController: BibleItemViewController,
    isHorizontal: boolean,
    bibleItems: BibleItem[],
    indices: number[],
}) {
    if (bibleItems.length === 0) {
        return (
            <NoBibleViewAvailable
                bibleItemViewController={bibleItemViewController}
            />
        );
    }
    if (bibleItems.length === 1) {
        return (
            <BibleView indices={[...indices, 0]}
                bibleItem={bibleItems[0]}
                fontSize={fontSize}
                bibleItemViewController={bibleItemViewController}
                isHorizontal={isHorizontal}
            />
        );
    }
    const typeText = isHorizontal ? 'h' : 'v';
    const contrastTypeText = isHorizontal ? 'v' : 'h';
    return (
        <ResizeActor
            fSizeName={RESIZE_SETTING_NAME}
            flexSizeDefault={Object.fromEntries(bibleItems.map((_, i) => {
                return [`${typeText}${i + 1}`, ['1']];
            }))}
            resizeKinds={Array.from({
                length: bibleItems.length - 1,
            }).map(() => typeText)}
            dataInput={bibleItems.map((item, i) => {
                const isFlexItem = !(item instanceof Array);
                return [
                    {
                        render: () => {
                            if (!isFlexItem) {
                                return (
                                    <BibleViewRenderer
                                        bibleItems={item}
                                        fontSize={fontSize}
                                        bibleItemViewController={
                                            bibleItemViewController
                                        }
                                        indices={[...indices, i]}
                                        isHorizontal={!isHorizontal}
                                    />
                                );
                            } else {
                                return (
                                    <BibleView
                                        bibleItem={item}
                                        fontSize={fontSize}
                                        bibleItemViewController={
                                            bibleItemViewController
                                        }
                                        indices={[...indices, i]}
                                        isHorizontal={isHorizontal}
                                    />
                                );
                            }
                        },
                    },
                    `${typeText}${i + 1}`,
                    isFlexItem ? 'flex-item' : (`flex ${contrastTypeText}`),
                ];
            })} />
    );
}
