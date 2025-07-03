import { useRef, useState } from 'react';
import { useAppEffectAsync } from '../helper/debuggerHelpers';
import { useStateSettingBoolean } from '../helper/settingHelpers';
import ForegroundRenderHeaderTitleComp from './ForegroundRenderHeaderTitleComp';
import LoadingComp from '../others/LoadingComp';
import ScreenForegroundManager from '../_screen/managers/ScreenForegroundManager';
import { getAndShowMedia } from '../_screen/screenForegroundHelpers';
import {
    getShowingScreenIds,
    getScreenManagerInstances,
} from './foregroundHelpers';
import ScreensRendererComp from './ScreensRendererComp';
import { useScreenForegroundManagerEvents } from '../_screen/managers/screenEventHelpers';
import { genTimeoutAttempt } from '../helper/helpers';
import { useForegroundPropsSetting } from './propertiesSettingHelpers';

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
    showingScreenIds: number[],
    extraStyle: React.CSSProperties,
) {
    attemptTimeout(() => {
        showingScreenIds.forEach((screenId) => {
            getScreenManagerInstances(screenId, (screenForegroundManager) => {
                const cameraData =
                    screenForegroundManager.foregroundData?.cameraData;
                if (cameraData === null) {
                    return;
                }
                screenForegroundManager.setCameraData(null);
                screenForegroundManager.setCameraData({
                    ...cameraData,
                    extraStyle,
                });
            });
        });
    });
}

export default function ForegroundCameraShowComp() {
    useScreenForegroundManagerEvents(['update']);
    const showingScreenIds = getShowingScreenIds((data) => {
        return data.cameraData !== null;
    });
    const { genStyle, element: propsSetting } = useForegroundPropsSetting({
        prefix: 'camera',
        onChange: (extraStyle) => {
            refreshAllCameras(showingScreenIds, extraStyle);
        },
    });
    const [cameraInfoList, setCameraInfoList] = useState<CameraInfoType[]>([]);
    const [isOpened, setIsOpened] = useStateSettingBoolean(
        'other-camera-show-opened',
        false,
    );
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
        getScreenManagerInstances(screenId, (screenForegroundManager) => {
            screenForegroundManager.setCameraData(null);
        });
    };
    return (
        <div className="card m-2">
            <div
                className={
                    'card-header d-flex justify-content-between' +
                    ' align-items-center'
                }
            >
                <ForegroundRenderHeaderTitleComp
                    isOpened={isOpened}
                    setIsOpened={setIsOpened}
                >
                    <h4>Camera Show</h4>
                </ForegroundRenderHeaderTitleComp>
                {!isOpened ? (
                    <ScreensRendererComp
                        showingScreenIds={showingScreenIds}
                        buttonTitle="Hide Camera"
                        handleForegroundHiding={handleCameraHiding}
                        isMini={true}
                    />
                ) : null}
            </div>
            {isOpened ? (
                <div
                    className="card-body w-100"
                    style={{
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
                    <ScreensRendererComp
                        showingScreenIds={showingScreenIds}
                        buttonTitle="Hide Camera"
                        handleForegroundHiding={handleCameraHiding}
                    />
                </div>
            ) : null}
        </div>
    );
}
