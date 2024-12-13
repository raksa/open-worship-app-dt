import { useState } from 'react';

import {
    DataInputType, FlexSizeType, getFlexSizeSetting, setFlexSizeSetting,
} from './flexSizeHelpers';
import { useAppEffect } from '../helper/debuggerHelpers';
import RenderResizeActorItem from './RenderResizeActorItem';
import { freezeObject } from '../helper/helpers';


export default function ResizeActor({
    isHorizontal, fSizeName, flexSizeDefault, dataInput,
    isDisableQuickResize, isNotSaveSetting = false,
}: Readonly<{
    isHorizontal: boolean,
    fSizeName: string,
    flexSizeDefault: Readonly<FlexSizeType>,
    dataInput: DataInputType[],
    isDisableQuickResize?: boolean,
    isNotSaveSetting?: boolean,
}>) {
    freezeObject(flexSizeDefault);
    for (const { key } of dataInput) {
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
    useAppEffect(() => {
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

    return (
        <div className={
            `w-100 h-100 flex ${isHorizontal ? 'h' : 'v'} overflow-hidden`
        }>
            {dataInput.map((data, i) => {
                const { key, className } = data;
                return (
                    <RenderResizeActorItem key={`${key}-${className}}`}
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
