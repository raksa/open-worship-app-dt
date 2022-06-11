import { Fragment } from 'react';
import FlexResizer, {
    getFlexSizeSetting, ResizerKindType,
} from './FlexResizer';

export default function ReSizer({
    settingName,
    flexSizeDefault,
    resizerKinds,
    sizeKeys,
    children,
}: {
    settingName: string,
    flexSizeDefault: { [key: string]: string },
    resizerKinds: ResizerKindType[],
    sizeKeys: [string, string, any?][],
    children: any[],
}) {
    const flexSize = getFlexSizeSetting(settingName, flexSizeDefault);
    return (
        <>
            {sizeKeys.map(([key, classList, style = {}], i) => {
                return (
                    <Fragment key={i}>
                        {i !== 0 && <FlexResizer settingName={settingName}
                            type={resizerKinds[i - 1]} />}
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
