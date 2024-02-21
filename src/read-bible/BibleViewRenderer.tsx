import { ReactNode } from 'react';

import BibleItemViewController, {
    NestedBibleItemsType, RESIZE_SETTING_NAME,
} from './BibleItemViewController';
import ResizeActor, { FlexSizeType } from '../resize-actor/ResizeActor';
import NoBibleViewAvailable from './NoBibleViewAvailable';
import BibleItem from '../bible-list/BibleItem';

export default function BibleViewRenderer({
    fontSize, bibleItemViewController, isHorizontal, nestedBibleItems,
    finalRenderer,
}: Readonly<{
    fontSize: number,
    bibleItemViewController: BibleItemViewController,
    isHorizontal: boolean,
    nestedBibleItems: NestedBibleItemsType,
    finalRenderer: (bibleItem: BibleItem) => ReactNode,
}>) {
    if (!(nestedBibleItems instanceof Array)) {
        return finalRenderer(nestedBibleItems);
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
                                    finalRenderer={finalRenderer}
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
