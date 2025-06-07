import { useRef, useState } from 'react';
import { useAppEffect } from '../helper/debuggerHelpers';
import { useStateSettingBoolean } from '../helper/settingHelpers';
import OtherRenderHeaderTitleComp from './OtherRenderHeaderTitleComp';
import LoadingComp from '../others/LoadingComp';
import ScreenOtherManager from '../_screen/managers/ScreenOtherManager';
import { getAndShowMedia } from '../_screen/screenOtherHelpers';
import { getShowingScreenIds, hideAlert } from './alertHelpers';
import ScreensRendererComp from './ScreensRendererComp';
import { useScreenOtherManagerEvents } from '../_screen/managers/screenEventHelpers';

type CameraInfoType = {
    deviceId: string;
    groupId: string;
    label: string;
};

function RenderCameraInfoComp({
    cameraInfo,
    width,
}: Readonly<{ cameraInfo: CameraInfoType; width: number }>) {
    const containerRef = useRef<HTMLDivElement>(null);
    useAppEffect(() => {
        if (containerRef.current === null) {
            return;
        }
        getAndShowMedia({
            id: cameraInfo.deviceId,
            container: containerRef.current,
            width,
        });
    }, [containerRef.current]);
    const handleCameraShowing = (event: any, isForceChoosing = false) => {
        ScreenOtherManager.setCamera(
            event,
            cameraInfo.deviceId,
            {
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: `${width}px`,
                height: 'auto',
                borderRadius: '50%',
            },
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
                onClick={handleCameraShowing}
                onContextMenu={handleContextMenuOpening}
                ref={containerRef}
            >
                <LoadingComp />
            </div>
        </div>
    );
}

export default function OtherCameraShowComp() {
    const [cameraInfoList, setCameraInfoList] = useState<CameraInfoType[]>([]);
    const [isOpened, setIsOpened] = useStateSettingBoolean(
        'other-camera-show-opened',
        true,
    );
    useScreenOtherManagerEvents(['update']);
    useAppEffect(() => {
        navigator.mediaDevices.enumerateDevices().then((devices) => {
            const cameraList: CameraInfoType[] = [];
            for (const device of devices) {
                if (device.kind === 'videoinput') {
                    cameraList.push(device);
                }
            }
            setCameraInfoList(cameraList);
        });
    }, []);
    const showingScreenIds = getShowingScreenIds((data) => {
        return data.cameraData !== null;
    });
    const handleCameraHiding = (screenId: number) => {
        hideAlert(screenId, (screenOtherManager) => {
            screenOtherManager.setCameraData(null);
        });
    };
    return (
        <div className="card m-2">
            <div className="card-header">
                <OtherRenderHeaderTitleComp
                    isOpened={isOpened}
                    setIsOpened={setIsOpened}
                >
                    <h4>Camera Show (TODO)</h4>
                </OtherRenderHeaderTitleComp>
            </div>
            {isOpened ? (
                <div
                    className="card-body"
                    style={{
                        maxHeight: '500px',
                        overflowY: 'auto',
                    }}
                >
                    <div className="d-flex flex-wrap">
                        {cameraInfoList.map((cameraInfo) => {
                            return (
                                <RenderCameraInfoComp
                                    key={cameraInfo.deviceId}
                                    cameraInfo={cameraInfo}
                                    width={300}
                                />
                            );
                        })}
                    </div>
                    <hr />
                    <ScreensRendererComp
                        showingScreenIds={showingScreenIds}
                        buttonTitle="Hide Marquee"
                        handleMarqueeHiding={handleCameraHiding}
                    />
                </div>
            ) : null}
        </div>
    );
}
