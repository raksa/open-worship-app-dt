import { Fragment } from 'react';

import AppSuspenseComp from '../others/AppSuspenseComp';
import FlexResizeActorComp, {
    ACTIVE_HIDDEN_WIDGET_CLASS,
    HIDDEN_WIDGET_CLASS,
} from './FlexResizeActorComp';
import {
    DisabledType,
    keyToDataFSizeKey,
    setDisablingSetting,
    genFlexSizeSetting,
    checkIsThereNotHiddenWidget,
    calcShowingHiddenWidget,
    DataInputType,
    FlexSizeType,
} from './flexSizeHelpers';

const renderChildren = (Children: any) => {
    if (typeof Children === 'object' && 'render' in Children) {
        return Children.render();
    }
    return (
        <AppSuspenseComp>
            <Children />
        </AppSuspenseComp>
    );
};

export default function RenderResizeActorItemComp({
    data,
    index,
    flexSize,
    setFlexSize,
    restoreFlexSize,
    defaultFlexSize,
    fSizeName,
    dataInput,
    isDisableQuickResize,
    isHorizontal,
}: Readonly<{
    data: DataInputType;
    index: number;
    flexSize: FlexSizeType;
    restoreFlexSize: FlexSizeType;
    defaultFlexSize: FlexSizeType;
    fSizeName: string;
    dataInput: DataInputType[];
    isDisableQuickResize: boolean;
    isHorizontal: boolean;
    setFlexSize: (flexSize: FlexSizeType) => void;
}>) {
    const handleDisabling = (
        targetDataFSizeKey: string,
        target: DisabledType,
    ) => {
        const size = setDisablingSetting(
            fSizeName,
            restoreFlexSize,
            targetDataFSizeKey,
            target,
        );
        setFlexSize(size);
    };
    const handleSizeChecking = () => {
        const size = genFlexSizeSetting(fSizeName, restoreFlexSize);
        setFlexSize(size);
    };

    const { children, key, className = '', extraStyle = {}, widgetName } = data;
    const flexSizeValue = flexSize[key] ?? restoreFlexSize[key] ?? [];
    const onHiddenWidgetClick = flexSizeValue[1]
        ? (event: any) => {
              const flexSizeDisabled = flexSizeValue[1] as DisabledType;
              const size = calcShowingHiddenWidget(
                  event,
                  key,
                  fSizeName,
                  restoreFlexSize,
                  flexSizeDisabled,
              );
              setFlexSize(size);
          }
        : null;

    let isShowingFSizeActor = false;
    if (
        index !== 0 &&
        onHiddenWidgetClick === null &&
        (checkIsThereNotHiddenWidget(dataInput, flexSize, 0, index) ||
            checkIsThereNotHiddenWidget(dataInput, flexSize, index + 1))
    ) {
        isShowingFSizeActor = true;
    }
    const type = isHorizontal ? 'h' : 'v';
    return (
        <Fragment key={index}>
            {isShowingFSizeActor && (
                <FlexResizeActorComp
                    isDisableQuickResize={isDisableQuickResize}
                    disable={handleDisabling}
                    checkSize={handleSizeChecking}
                    type={type}
                />
            )}
            {onHiddenWidgetClick !== null ? (
                <div
                    title={`Enable ${widgetName}`}
                    className={
                        `${ACTIVE_HIDDEN_WIDGET_CLASS} ` +
                        `${HIDDEN_WIDGET_CLASS} pointer bar-type-${type}`
                    }
                    style={{ color: 'green' }}
                    onClick={onHiddenWidgetClick}
                >
                    <div className="hidden-context">{widgetName}</div>
                </div>
            ) : (
                <div
                    data-fs={keyToDataFSizeKey(fSizeName, key)}
                    data-fs-default={defaultFlexSize[key][0]}
                    data-min-size={50}
                    className={`${className} overflow-hidden`}
                    style={{
                        flex: `${flexSizeValue[0] || 1}`,
                        ...extraStyle,
                    }}
                >
                    {renderChildren(children)}
                </div>
            )}
        </Fragment>
    );
}
