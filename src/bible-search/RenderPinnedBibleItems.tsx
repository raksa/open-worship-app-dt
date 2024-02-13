import RenderBibleDataFound from './RenderBibleDataFound';
import BibleItem from '../bible-list/BibleItem';
import ResizeActor from '../resize-actor/ResizeActor';

const RESIZE_SETTING_NAME = 'pinned-bible-items';

export default function RenderPinnedBibleItems({
    pinnedBibleItems, setPinnedBibleItems,
}: Readonly<{
    pinnedBibleItems: BibleItem[],
    setPinnedBibleItems: (newPinnedBibleItems: BibleItem[]) => void,
}>) {
    const unpinBibleItem = (currentBibleItem: BibleItem) => {
        setPinnedBibleItems(
            pinnedBibleItems.filter(
                (i) => i.id !== currentBibleItem.id,
            ),
        );
    };
    return (
        <div className='d-flex w-100 h-100'>
            {pinnedBibleItems.length === 1 ?
                <RenderBibleDataFound
                    bibleItem={pinnedBibleItems[0]}
                    onPinning={() => unpinBibleItem(pinnedBibleItems[0])}
                /> :
                <ResizeActor
                    fSizeName={RESIZE_SETTING_NAME}
                    isDisableQuickResize={true}
                    flexSizeDefault={Object.fromEntries(
                        pinnedBibleItems.map((_, i) => {
                            return [`h${i + 1}`, ['1']];
                        }),
                    )}
                    resizeKinds={Array.from({
                        length: pinnedBibleItems.length - 1,
                    }).map(() => 'h')}
                    dataInput={pinnedBibleItems.map((pinnedBibleItem, i) => {
                        return [{
                            render: () => {
                                return (
                                    <RenderBibleDataFound
                                        bibleItem={pinnedBibleItem}
                                        onPinning={() => {
                                            unpinBibleItem(pinnedBibleItem);
                                        }}
                                    />
                                );
                            },
                        }, `h${i + 1}`, 'flex-item'];
                    })} />
            }
        </div>
    );
}
