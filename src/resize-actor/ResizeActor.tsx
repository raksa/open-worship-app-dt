import React, {
    CSSProperties, Fragment,
    useCallback, useState,
} from 'react';
import AppSuspense from '../others/AppSuspense';
import FlexResizeActor, {
    ResizeKindType,
} from './FlexResizeActor';
import {
    DisabledType,
    getFlexSizeSetting,
    keyToDataFSizeKey,
    setDisablingSetting,
    setFlexSizeSetting,
} from './flexSizeHelpers';

export type FlexSizeType = {
    [key: string]: [string, DisabledType?],
};
export type DataInputType = [
    React.LazyExoticComponent<() => JSX.Element | null>,
    string,
    string,
    CSSProperties?,
];
export default function ResizeActor({
    fSizeName, flexSizeDefault,
    resizeKinds, dataInput,
}: {
    fSizeName: string,
    flexSizeDefault: FlexSizeType,
    resizeKinds: ResizeKindType[],
    dataInput: DataInputType[],
}) {
    const defaultFlexSize = getFlexSizeSetting(fSizeName, flexSizeDefault);
    const [flexSize, setFlexSize] = useState(defaultFlexSize);
    return (
        <>
            {dataInput.map((data, i) => {
                return (
                    <RenderItem key={`${data[1]}-${data[2]}}`}
                        data={data}
                        index={i}
                        flexSize={flexSize}
                        setFlexSize={setFlexSize}
                        defaultFlexSize={defaultFlexSize}
                        fSizeName={fSizeName}
                        dataInput={dataInput}
                        resizeKinds={resizeKinds}
                    />
                );
            })}
        </>
    );
}

function RenderItem({
    data, index, flexSize, setFlexSize,
    defaultFlexSize, fSizeName, dataInput,
    resizeKinds,
}: {
    data: DataInputType,
    index: number,
    flexSize: FlexSizeType,
    setFlexSize: (flexSize: FlexSizeType) => void,
    defaultFlexSize: FlexSizeType,
    fSizeName: string,
    dataInput: DataInputType[],
    resizeKinds: ResizeKindType[],
}) {
    const disableCallback = useCallback((
        targetDataFSizeKey: string, target: DisabledType) => {
        const size = setDisablingSetting(fSizeName, defaultFlexSize,
            targetDataFSizeKey, target);
        setFlexSize(size);
    }, [fSizeName, defaultFlexSize]);
    const checkSizeCallback = useCallback(() => {
        const size = setFlexSizeSetting(fSizeName, defaultFlexSize);
        setFlexSize(size);
    }, [fSizeName, defaultFlexSize]);
    const [Children, key, classList, style = {}] = data;
    const flexSizeValue = flexSize[key];
    const dataFSizeKey = keyToDataFSizeKey(fSizeName, key);
    if (flexSizeValue[1]) {
        const onClick = (event: any) => {
            setDisablingSetting(fSizeName, defaultFlexSize, dataFSizeKey);
            const current = event.currentTarget;
            const flexSizeDisabled = flexSizeValue[1] as DisabledType;
            const target = (flexSizeDisabled[0] === 'first' ?
                current.nextElementSibling :
                current.previousElementSibling) as HTMLDivElement;
            const targetFGrow = Number(target.style.flexGrow);
            const flexGrow = targetFGrow - flexSizeDisabled[1];
            target.style.flexGrow = `${flexGrow < targetFGrow / 10 ?
                targetFGrow : flexGrow}`;
            const size = setFlexSizeSetting(fSizeName, defaultFlexSize);
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
                disable={disableCallback}
                checkSize={checkSizeCallback}
                type={resizeKinds[index - 1]} />}
            <div data-fs={keyToDataFSizeKey(fSizeName, key)}
                data-fs-default={flexSizeValue[0]}
                data-min-size={140}
                className={classList}
                style={{
                    flex: flexSizeValue[0] || 1,
                    ...style,
                }}>
                <AppSuspense>
                    <Children />
                </AppSuspense>
            </div>
        </Fragment>
    );
}