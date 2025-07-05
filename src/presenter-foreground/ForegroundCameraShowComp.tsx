import { useRef, useState } from 'react';
import { useAppEffectAsync } from '../helper/debuggerHelpers';
import LoadingComp from '../others/LoadingComp';
import ScreenForegroundManager from '../_screen/managers/ScreenForegroundManager';
import { getAndShowMedia } from '../_screen/screenForegroundHelpers';
import {
    getScreenForegroundManagerInstances,
    getForegroundShowingScreenIdDataList,
} from './foregroundHelpers';
import ScreensRendererComp from './ScreensRendererComp';
import { useScreenForegroundManagerEvents } from '../_screen/managers/screenEventHelpers';
import { genTimeoutAttempt } from '../helper/helpers';
import { useForegroundPropsSetting } from './propertiesSettingHelpers';
import { ForegroundCameraDataType } from '../_screen/screenTypeHelpers';
import ForegroundLayoutComp from './ForegroundLayoutComp';

type CameraInfoType = {
    deviceId: string;
    groupId: string;
    label: string;
};

function RenderCameraInfoComp({
    cameraInfo,
    width,
    genStyle,
}: Readonly<{
    cameraInfo: CameraInfoType;
    width: number;
    genStyle: () => React.CSSProperties;
}>) {
    const containerRef = useRef<HTMLDivElement>(null);
    useAppEffectAsync(async () => {
        if (containerRef.current === null) {
            return;
        }
        return await getAndShowMedia({
            id: cameraInfo.deviceId,
            container: containerRef.current,
            width,
        });
    }, [containerRef.current]);
    const handleCameraShowing = (event: any, isForceChoosing = false) => {
        ScreenForegroundManager.setCamera(
            event,
            cameraInfo.deviceId,
            genStyle(),
            isForceChoosing,
        );
    };
    const handleContextMenuOpening = (event: any) => {
        handleCameraShowing(event, true);
    };

    return (
        <div className="card m-2" style={{ width: `${width}px` }}>
            <div className="card-header app-ellipsis" title={cameraInfo.label}>
                {cameraInfo.label}
            </div>
            <div
                className={
                    'card-body w-100 p-0 overflow-hidden' +
                    ' app-caught-hover-pointer'
                }
                // TODO: implement drag and drop
                onClick={handleCameraShowing}
                onContextMenu={handleContextMenuOpening}
                ref={containerRef}
            >
                <LoadingComp />
            </div>
        </div>
    );
}

const attemptTimeout = genTimeoutAttempt(500);
function refreshAllCameras(
    showingScreenIdDataList: [number, ForegroundCameraDataType][],
    extraStyle: React.CSSProperties,
) {
    attemptTimeout(() => {
        showingScreenIdDataList.forEach(([screenId, data]) => {
            getScreenForegroundManagerInstances(
                screenId,
                (screenForegroundManager) => {
                    screenForegroundManager.setCameraData(null);
                    screenForegroundManager.setCameraData({
                        ...data,
                        extraStyle,
                    });
                },
            );
        });
    });
}

export default function ForegroundCameraShowComp() {
    useScreenForegroundManagerEvents(['update']);
    const showingScreenIdDataList = getForegroundShowingScreenIdDataList(
        (data) => {
            return data.cameraData !== null;
        },
    ).map(([screenId, data]) => {
        return [screenId, data.cameraData] as [
            number,
            ForegroundCameraDataType,
        ];
    });
    const { genStyle, element: propsSetting } = useForegroundPropsSetting({
        prefix: 'camera',
        onChange: (extraStyle) => {
            refreshAllCameras(showingScreenIdDataList, extraStyle);
        },
    });
    const [cameraInfoList, setCameraInfoList] = useState<CameraInfoType[]>([]);
    useAppEffectAsync(
        async (contextMethods) => {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const cameraList: CameraInfoType[] = [];
            for (const device of devices) {
                if (device.kind === 'videoinput') {
                    cameraList.push(device);
                }
            }
            contextMethods.setCameraInfoList(cameraList);
        },
        [],
        { setCameraInfoList },
    );
    const handleCameraHiding = (screenId: number) => {
        getScreenForegroundManagerInstances(
            screenId,
            (screenForegroundManager) => {
                screenForegroundManager.setCameraData(null);
            },
        );
    };
    const genHidingElement = (isMini: boolean) => (
        <ScreensRendererComp
            showingScreenIdDataList={showingScreenIdDataList}
            buttonTitle="`Hide Camera"
            handleForegroundHiding={handleCameraHiding}
            isMini={isMini}
        />
    );
    return (
        <ForegroundLayoutComp
            target="camera"
            fullChildHeaders={<h4>`Camera Show</h4>}
            childHeadersOnHidden={genHidingElement(true)}
            extraBodyStyle={{
                maxHeight: '500px',
                overflowX: 'hidden',
                overflowY: 'auto',
            }}
        >
            {propsSetting}
            <hr />
            <div className="d-flex flex-wrap">
                {cameraInfoList.map((cameraInfo) => {
                    return (
                        <RenderCameraInfoComp
                            key={cameraInfo.deviceId}
                            cameraInfo={cameraInfo}
                            width={300}
                            genStyle={genStyle}
                        />
                    );
                })}
            </div>
            <hr />
            {genHidingElement(false)}
        </ForegroundLayoutComp>
    );
}
