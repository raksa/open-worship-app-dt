import {
    CSSProperties, Fragment, LazyExoticComponent, useCallback, useEffect,
    useState,
} from 'react';

import AppSuspense from '../others/AppSuspense';
import FlexResizeActor from './FlexResizeActor';
import {
    DisabledType, getFlexSizeSetting, keyToDataFSizeKey, setDisablingSetting,
    genFlexSizeSetting, setFlexSizeSetting,
} from './flexSizeHelpers';

export type FlexSizeType = {
    [key: string]: [string, DisabledType?],
};
export type DataInputType = [
    LazyExoticComponent<() => React.JSX.Element | null> | {
        render: () => React.JSX.Element | null,
    },
    string,
    string,
    CSSProperties?,
];
export default function ResizeActor({
    isHorizontal, fSizeName, flexSizeDefault, dataInput,
    isDisableQuickResize, isNotSaveSetting = false,
}: Readonly<{
    isHorizontal: boolean,
    fSizeName: string,
    flexSizeDefault: FlexSizeType,
    dataInput: DataInputType[],
    isDisableQuickResize?: boolean,
    isNotSaveSetting?: boolean,
}>) {
    for (const [_, key, __] of dataInput) {
        if (flexSizeDefault[key] === undefined) {
            throw new Error(
                `key ${key} not found in flexSizeDefault:` +
                JSON.stringify(flexSizeDefault)
            );
        }
    }
    const defaultFlexSize = (
        isNotSaveSetting ? flexSizeDefault :
            getFlexSizeSetting(fSizeName, flexSizeDefault)
    );
    const [flexSize, setFlexSize] = useState(defaultFlexSize);
    const setFlexSize1 = (newFlexSize: FlexSizeType) => {
        if (!isNotSaveSetting) {
            setFlexSizeSetting(fSizeName, newFlexSize);
        }
        setFlexSize(newFlexSize);
    };
    useEffect(() => {
        const foundDiff = [];
        const newFlexSize = { ...flexSize };
        for (const key in flexSizeDefault) {
            if (!newFlexSize[key]) {
                newFlexSize[key] = flexSizeDefault[key];
                foundDiff.push(key);
            }
        }
        for (const key in newFlexSize) {
            if (!flexSizeDefault[key]) {
                delete newFlexSize[key];
                foundDiff.push(key);
            }
        }
        if (foundDiff.length > 0) {
            setFlexSize1(newFlexSize);
        }
    }, [flexSize, flexSizeDefault]);
    console.log(flexSize, dataInput);

    return (
        <div className={
            `w-100 h-100 flex ${isHorizontal ? 'h' : 'v'} overflow-hidden`
        }>
            {dataInput.map((data, i) => {
                return (
                    <RenderItem key={`${data[1]}-${data[2]}}`}
                        data={data}
                        index={i}
                        flexSize={flexSize}
                        setFlexSize={setFlexSize1}
                        defaultFlexSize={defaultFlexSize}
                        fSizeName={fSizeName}
                        dataInput={dataInput}
                        isDisableQuickResize={isDisableQuickResize || false}
                        isHorizontal={isHorizontal}
                    />
                );
            })}
        </div>
    );
}

function RenderItem({
    data, index, flexSize, setFlexSize, defaultFlexSize, fSizeName,
    dataInput, isDisableQuickResize, isHorizontal,
}: Readonly<{
    data: DataInputType,
    index: number,
    flexSize: FlexSizeType,
    setFlexSize: (flexSize: FlexSizeType) => void,
    defaultFlexSize: FlexSizeType,
    fSizeName: string,
    dataInput: DataInputType[],
    isDisableQuickResize: boolean,
    isHorizontal: boolean,
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
    const [Children, key, classList, style = {}] = data;
    const renderChildren = () => {
        if (typeof Children === 'object' && 'render' in Children) {
            return Children.render();
        }
        return (
            <AppSuspense>
                <Children />
            </AppSuspense>
        );
    };
    const flexSizeValue = (flexSize[key] || defaultFlexSize[key]) || [];
    const dataFSizeKey = keyToDataFSizeKey(fSizeName, key);
    if (flexSizeValue[1]) {
        const onClick = (event: any) => {
            setDisablingSetting(
                fSizeName, defaultFlexSize, dataFSizeKey,
            );
            const current = event.currentTarget;
            const flexSizeDisabled = flexSizeValue[1] as DisabledType;
            const target = (
                flexSizeDisabled[0] === 'first' ? current.nextElementSibling :
                    current.previousElementSibling
            ) as HTMLDivElement;
            const targetFGrow = Number(target.style.flexGrow);
            const flexGrow = targetFGrow - flexSizeDisabled[1];
            target.style.flexGrow = (
                `${flexGrow < targetFGrow / 10 ? targetFGrow : flexGrow}`
            );
            const size = genFlexSizeSetting(
                fSizeName, defaultFlexSize,
            );
            setFlexSize(size);
        };
        return (
            <div key={fSizeName}
                title='Enable'
                className='hidden-widget pointer'
                style={{ color: 'green' }}
                onClick={onClick} />
        );
    }
    let isShowingFSizeActor = index !== 0;
    if (isShowingFSizeActor) {
        const preKey = dataInput[index - 1][1];
        const preFlexSizeValue = flexSize[preKey];
        isShowingFSizeActor = !preFlexSizeValue[1];
    }
    return (
        <Fragment key={index}>
            {isShowingFSizeActor && <FlexResizeActor
                isDisableQuickResize={isDisableQuickResize}
                disable={disableCallback}
                checkSize={checkSizeCallback}
                type={isHorizontal ? 'h' : 'v'} />}
            <div data-fs={keyToDataFSizeKey(fSizeName, key)}
                data-fs-default={flexSizeValue[0]}
                data-min-size={40}
                className={`${classList} overflow-hidden`}
                style={{
                    flex: flexSizeValue[0] || 1,
                    ...style,
                }}>
                {renderChildren()}
            </div>
        </Fragment>
    );
}
