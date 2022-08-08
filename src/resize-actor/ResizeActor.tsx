import React, {
    CSSProperties, Fragment, useState,
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
                const [Children, key, classList, style = {}] = data;
                const flexSizeValue = flexSize[key];
                const dataFSizeKey = keyToDataFSizeKey(fSizeName, key);
                if (flexSizeValue[1]) {
                    return (
                        <div key={i}
                            title='Enable'
                            className='hidden-widget pointer'
                            style={{ color: 'green' }}
                            onClick={(e) => {
                                setDisablingSetting(fSizeName, defaultFlexSize, dataFSizeKey);
                                const current = e.currentTarget;
                                const flexSizeDisabled = flexSizeValue[1] as DisabledType;
                                const target = (flexSizeDisabled[0] === 'first' ?
                                    current.nextElementSibling : current.previousElementSibling) as HTMLDivElement;
                                const targetFGrow = Number(target.style.flexGrow);
                                const flexGrow = targetFGrow - flexSizeDisabled[1];
                                target.style.flexGrow = `${flexGrow < targetFGrow / 10 ? targetFGrow : flexGrow}`;
                                const size = setFlexSizeSetting(fSizeName, defaultFlexSize);
                                setFlexSize(size);
                            }} />
                    );
                }
                let isShowingFSizeActor = i !== 0;
                if (isShowingFSizeActor) {
                    const preKey = dataInput[i - 1][1];
                    const preFlexSizeValue = flexSize[preKey];
                    isShowingFSizeActor = !preFlexSizeValue[1];
                }
                return (
                    <Fragment key={i}>
                        {isShowingFSizeActor && <FlexResizeActor
                            disable={(targetDataFSizeKey, target) => {
                                const size = setDisablingSetting(fSizeName, defaultFlexSize,
                                    targetDataFSizeKey, target);
                                setFlexSize(size);
                            }}
                            checkSize={() => {
                                const size = setFlexSizeSetting(fSizeName, defaultFlexSize);
                                setFlexSize(size);
                            }}
                            type={resizeKinds[i - 1]} />}
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
            })}
        </>
    );
}
