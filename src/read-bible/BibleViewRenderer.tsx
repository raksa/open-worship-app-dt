import { useContext } from 'react';

import {
    BibleItemViewControllerContext, NestedBibleItemsType, RESIZE_SETTING_NAME,
} from './BibleItemViewController';
import ResizeActor, { FlexSizeType } from '../resize-actor/ResizeActor';
import NoBibleViewAvailable from './NoBibleViewAvailable';

export default function BibleViewRenderer({
    isHorizontal, nestedBibleItems,
}: Readonly<{
    isHorizontal: boolean,
    nestedBibleItems: NestedBibleItemsType,
}>) {
    const bibleItemViewController = useContext(BibleItemViewControllerContext);
    if (!(nestedBibleItems instanceof Array)) {
        return bibleItemViewController.finalRenderer(nestedBibleItems);
    }
    if (nestedBibleItems.length === 0) {
        return (
            <NoBibleViewAvailable
                bibleItemViewController={bibleItemViewController}
            />
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
