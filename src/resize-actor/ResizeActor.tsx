import { Fragment, useState } from 'react';
import { getSetting, setSetting } from '../helper/settingHelper';
import FlexResize, { ResizeKindType } from './FlexResizeActor';

export type Size = { [key: string]: string };
export default function ResizeActor({
    settingName,
    flexSizeDefault,
    resizeKinds,
    sizeKeys,
    children,
}: {
    settingName: string,
    flexSizeDefault: Size,
    resizeKinds: ResizeKindType[],
    sizeKeys: [string, string, any?][],
    children: any[],
}) {
    const [flexSize, setFlexSize] = useState(getFlexSizeSetting(settingName, flexSizeDefault));
    return (
        <>
            {sizeKeys.map(([key, classList, style = {}], i) => {
                return (
                    <Fragment key={i}>
                        {i !== 0 && <FlexResize
                            checkSize={() => {
                                const size = saveSize(settingName);
                                setFlexSize(size);
                            }}
                            type={resizeKinds[i - 1]} />}
                        <div data-fs={key} data-fs-default={flexSize[key]}
                            className={classList}
                            style={{ flex: flexSize[key] || 1, ...style }}>
                            {children[i]}
                        </div>
                    </Fragment>
                );
            })}
        </>
    );
}

const saveSize = (settingName: string) => {
    const size: Size = {};
    const rowItems: HTMLDivElement[] = Array.from(document.querySelectorAll('[data-fs]'));
    rowItems.forEach((item) => {
        size[item.getAttribute('data-fs') as string] = item.style.flex;
    });
    setSetting(settingName, JSON.stringify(size));
    return size;
};

function getFlexSizeSetting(settingName: string, defaultSize: Size): Size {
    const sizeStr = getSetting(settingName);
    try {
        const size = JSON.parse(sizeStr);
        if (Object.keys(defaultSize).every((k) => size[k] !== undefined)) {
            return size;
        }
    } catch (error) {
        setSetting(settingName, JSON.stringify(defaultSize));
    }
    return defaultSize;
}
