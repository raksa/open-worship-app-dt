import { Fragment, useCallback } from 'react';

import AppSuspense from '../others/AppSuspense';
import FlexResizeActor, {
    ACTIVE_HIDDEN_WIDGET_CLASS, HIDDEN_WIDGET_CLASS,
} from './FlexResizeActor';
import {
    DisabledType, keyToDataFSizeKey, setDisablingSetting, genFlexSizeSetting,
    checkIsThereNotHiddenWidget, calcShowingHiddenWidget, DataInputType,
    FlexSizeType,
} from './flexSizeHelpers';

const renderChildren = (Children: any) => {
    if (typeof Children === 'object' && 'render' in Children) {
        return Children.render();
    }
    return (
        <AppSuspense>
            <Children />
        </AppSuspense>
    );
};

export default function RenderResizeActorItem({
    data, index, flexSize, setFlexSize, defaultFlexSize, fSizeName,
    dataInput, isDisableQuickResize, isHorizontal,
}: Readonly<{
    data: DataInputType,
    index: number,
    flexSize: FlexSizeType,
    defaultFlexSize: FlexSizeType,
    fSizeName: string,
    dataInput: DataInputType[],
    isDisableQuickResize: boolean,
    isHorizontal: boolean,
    setFlexSize: (flexSize: FlexSizeType) => void,
}>) {
    const disableCallback = useCallback((
        targetDataFSizeKey: string, target: DisabledType) => {
        const size = setDisablingSetting(
            fSizeName, defaultFlexSize, targetDataFSizeKey, target,
        );
        setFlexSize(size);
    }, [fSizeName, defaultFlexSize]);
    const checkSizeCallback = useCallback(() => {
        const size = genFlexSizeSetting(fSizeName, defaultFlexSize);
        setFlexSize(size);
    }, [fSizeName, defaultFlexSize]);

    const { children, key, className = '', extraStyle = {} } = data;
    const flexSizeValue = (flexSize[key] || defaultFlexSize[key]) || [];
    const onHiddenWidgetClick = flexSizeValue[1] ? (event: any) => {
        const flexSizeDisabled = flexSizeValue[1] as DisabledType;
        const size = calcShowingHiddenWidget(
            event, key, fSizeName, defaultFlexSize, flexSizeDisabled,
        );
        setFlexSize(size);
    } : null;

    let isShowingFSizeActor = false;
    if (index !== 0 && onHiddenWidgetClick === null && (
        checkIsThereNotHiddenWidget(dataInput, flexSize, 0, index) ||
        checkIsThereNotHiddenWidget(dataInput, flexSize, index + 1)
    )) {
        isShowingFSizeActor = true;
    }
    return (
        <Fragment key={index}>
            {isShowingFSizeActor && (
                <FlexResizeActor
                    isDisableQuickResize={isDisableQuickResize}
                    disable={disableCallback}
                    checkSize={checkSizeCallback}
                    type={isHorizontal ? 'h' : 'v'}
                />
            )}
            {onHiddenWidgetClick !== null ? (
                <div title='Enable'
                    className={
                        `${ACTIVE_HIDDEN_WIDGET_CLASS} ` +
                        `${HIDDEN_WIDGET_CLASS} pointer`
                    }
                    style={{ color: 'green' }}
                    onClick={onHiddenWidgetClick}
                />
            ) : (
                <div data-fs={keyToDataFSizeKey(fSizeName, key)}
                    data-fs-default={flexSizeValue[0]}
                    data-min-size={50}
                    className={`${className} overflow-hidden`}
                    style={{
                        flex: flexSizeValue[0] || 1,
                        ...extraStyle,
                    }}>
                    {renderChildren(children)}
                </div>
            )}
        </Fragment>
    );
}
