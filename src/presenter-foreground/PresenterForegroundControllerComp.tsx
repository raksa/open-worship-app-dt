import appProvider from '../server/appProvider';
import ForegroundCameraShowComp from './ForegroundCameraShowComp';
import ForegroundCountDownComp from './ForegroundCountDownComp';
import ForegroundImagesSlideShowComp from './ForegroundImagesSlideShowComp';
import ForegroundMessageComp from './ForegroundMessageComp';

export default function PresenterForegroundControllerComp() {
    return (
        <div
            className="w-100 h-100 app-border-white-round"
            style={{
                overflowY: 'auto',
            }}
        >
            <ForegroundMessageComp />
            <hr />
            <ForegroundCountDownComp />
            {appProvider.systemUtils.isDev ? (
                <>
                    <hr />
                    <div>TODO: Time</div>
                </>
            ) : null}
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
