import appProvider from '../server/appProvider';
import ForegroundCameraShowComp from './ForegroundCameraShowComp';
import ForegroundCommonPropertiesSettingComp from './ForegroundCommonPropertiesSettingComp';
import ForegroundCountDownComp from './ForegroundCountDownComp';
import ForegroundImagesSlideShowComp from './ForegroundImagesSlideShowComp';
import ForegroundMessageComp from './ForegroundMessageComp';
import ForegroundTimeComp from './ForegroundTimeComp';

export default function PresenterForegroundComp() {
    return (
        <div
            className="w-100 h-100 app-border-white-round p-2"
            style={{
                overflowY: 'auto',
                backgroundColor: 'var(--bs-gray-800)',
            }}
        >
            <ForegroundCommonPropertiesSettingComp />
            <hr />
            <ForegroundMessageComp />
            <hr />
            {appProvider.systemUtils.isDev ? (
                <>
                    <hr />
                    <div>TODO: Quick Alert</div>
                </>
            ) : null}
            <hr />
            <ForegroundCountDownComp />
            <hr />
            <ForegroundTimeComp />
            <hr />
            <ForegroundImagesSlideShowComp />
            <hr />
            {appProvider.systemUtils.isDev ? (
                <>
                    <hr />
                    <div>TODO: Stopwatch</div>
                </>
            ) : null}
            <hr />
            <ForegroundCameraShowComp />
            {appProvider.systemUtils.isDev ? (
                <>
                    <hr />
                    <div>TODO: Javascript Show</div>
                </>
            ) : null}
        </div>
    );
}
