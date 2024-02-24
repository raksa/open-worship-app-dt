
import {
    NestedBibleItemsType, RESIZE_SETTING_NAME,
    useBibleItemViewControllerContext,
} from './BibleItemViewController';
import ResizeActor, { FlexSizeType } from '../resize-actor/ResizeActor';
import NoBibleViewAvailable from './NoBibleViewAvailable';

export default function BibleViewRenderer({
    isHorizontal, nestedBibleItems,
}: Readonly<{
    isHorizontal: boolean,
    nestedBibleItems: NestedBibleItemsType,
}>) {
    const bibleItemViewController = useBibleItemViewControllerContext();
    if (!(nestedBibleItems instanceof Array)) {
        return bibleItemViewController.finalRenderer(nestedBibleItems);
    }
    if (nestedBibleItems.length === 0) {
        return (
            <NoBibleViewAvailable />
        );
    }
    if (nestedBibleItems.length === 1) {
        return (
            <BibleViewRenderer
                nestedBibleItems={nestedBibleItems[0]}
                isHorizontal={!isHorizontal}
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
            fSizeName={
                bibleItemViewController.toSettingName(RESIZE_SETTING_NAME)
            }
            isNotSaveSetting
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
