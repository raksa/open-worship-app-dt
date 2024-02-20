import BibleView from './BibleView';
import BibleItemViewController, {
    NestedBibleItemsType,
    RESIZE_SETTING_NAME,
} from './BibleItemViewController';
import ResizeActor, { FlexSizeType } from '../resize-actor/ResizeActor';
import NoBibleViewAvailable from './NoBibleViewAvailable';

export default function BibleViewRenderer({
    fontSize, bibleItemViewController, isHorizontal, nestedBibleItems,
}: Readonly<{
    fontSize: number,
    bibleItemViewController: BibleItemViewController,
    isHorizontal: boolean,
    nestedBibleItems: NestedBibleItemsType,
}>) {
    if (!(nestedBibleItems instanceof Array)) {
        return (
            <BibleView
                bibleItem={nestedBibleItems}
                fontSize={fontSize}
                bibleItemViewController={bibleItemViewController}
            />
        );
    }
    if (nestedBibleItems.length === 0) {
        return (
            <NoBibleViewAvailable
                bibleItemViewController={bibleItemViewController}
            />
        );
    }
    const typeText = isHorizontal ? 'h' : 'v';
    const contrastTypeText = isHorizontal ? 'v' : 'h';
    const flexSizeDefault = Object.fromEntries(nestedBibleItems.map((_, i) => {
        return [`${typeText}${i + 1}`, ['1']];
    })) as FlexSizeType;
    return (
        <ResizeActor
            fSizeName={RESIZE_SETTING_NAME}
            isDisableQuickResize={true}
            flexSizeDefault={flexSizeDefault}
            resizeKinds={Array.from({
                length: nestedBibleItems.length - 1,
            }).map(() => typeText)}
            dataInput={nestedBibleItems.map((item, i) => {
                return [
                    {
                        render: () => {
                            return (
                                <BibleViewRenderer
                                    nestedBibleItems={item}
                                    fontSize={fontSize}
                                    bibleItemViewController={
                                        bibleItemViewController
                                    }
                                    isHorizontal={!isHorizontal}
                                />
                            );
                        },
                    },
                    `${typeText}${i + 1}`,
                    `flex ${contrastTypeText}`,
                ];
            })} />
    );
}
