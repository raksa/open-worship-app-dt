import {
    NestedBibleItemsType, RESIZE_SETTING_NAME,
    useBibleItemViewControllerContext,
} from './BibleItemViewController';
import ResizeActor, {
} from '../resize-actor/ResizeActor';
import NoBibleViewAvailable from './NoBibleViewAvailable';
import { FlexSizeType, DataInputType } from '../resize-actor/flexSizeHelpers';

export default function BibleViewRenderer({
    isHorizontal = true, classPrefix = '', nestedBibleItems,
}: Readonly<{
    isHorizontal?: boolean,
    classPrefix?: string,
    nestedBibleItems: NestedBibleItemsType,
}>) {
    const viewController = useBibleItemViewControllerContext();
    if (!(nestedBibleItems instanceof Array)) {
        return viewController.finalRenderer(nestedBibleItems);
    }
    if (nestedBibleItems.length === 0) {
        return (
            <NoBibleViewAvailable />
        );
    }
    const typeText = isHorizontal ? 'h' : 'v';
    classPrefix += typeText;
    if (nestedBibleItems.length === 1) {
        return (
            <BibleViewRenderer
                nestedBibleItems={nestedBibleItems[0]}
                isHorizontal={!isHorizontal}
                classPrefix={classPrefix}
            />
        );
    }
    const flexSizeDefault = Object.fromEntries(nestedBibleItems.map((_, i) => {
        return [`${typeText}${i + 1}`, ['1']];
    })) as FlexSizeType;
    return (
        <ResizeActor
            fSizeName={
                viewController.toSettingName(
                    `${RESIZE_SETTING_NAME}-${classPrefix}`
                )
            }
            isHorizontal={isHorizontal}
            isNotSaveSetting
            isDisableQuickResize={true}
            flexSizeDefault={flexSizeDefault}
            dataInput={nestedBibleItems.map((item, i): DataInputType => {
                return {
                    children: {
                        render: () => {
                            return (
                                <BibleViewRenderer
                                    nestedBibleItems={item}
                                    isHorizontal={!isHorizontal}
                                    classPrefix={classPrefix}
                                />
                            );
                        },
                    },
                    key: `${typeText}${i + 1}`,
                    widgetName: 'Bible View',
                };
            })} />
    );
}
