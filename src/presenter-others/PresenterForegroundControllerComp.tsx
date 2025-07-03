import appProvider from '../server/appProvider';
import OtherCameraShowComp from './OtherCameraShowComp';
import OtherCountDownComp from './OtherCountDownComp';
import OtherImagesSlideShowComp from './OtherImagesSlideShowComp';
import OtherMessageComp from './OtherMessageComp';

export default function PresenterForegroundControllerComp() {
    return (
        <div
            className="w-100 h-100 app-border-white-round"
            style={{
                overflowY: 'auto',
            }}
        >
            <OtherMessageComp />
            <hr />
            <OtherCountDownComp />
            {appProvider.systemUtils.isDev ? (
                <>
                    <hr />
                    <div>TODO: Time</div>
                </>
            ) : null}
            <hr />
            <OtherImagesSlideShowComp />
            <hr />
            {appProvider.systemUtils.isDev ? (
                <>
                    <hr />
                    <div>TODO: Stopwatch</div>
                </>
            ) : null}
            <hr />
            <OtherCameraShowComp />
            {appProvider.systemUtils.isDev ? (
                <>
                    <hr />
                    <div>TODO: Javascript Show</div>
                </>
            ) : null}
        </div>
    );
}
