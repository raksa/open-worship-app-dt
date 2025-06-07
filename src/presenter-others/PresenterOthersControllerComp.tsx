import appProvider from '../server/appProvider';
import CountDownComp from './CountDownComp';
import ImagesSlideShowComp from './ImagesSlideShowComp';
import MarqueeComp from './MarqueeComp';

export default function PresenterOthersControllerComp() {
    return (
        <div
            className="w-100 h-100 app-border-white-round"
            style={{
                overflowY: 'auto',
            }}
        >
            <MarqueeComp />
            <hr />
            <CountDownComp />
            <hr />
            <ImagesSlideShowComp />
            <hr />
            <div>TODO: Camera Show</div>
            {appProvider.systemUtils.isDev ? (
                <>
                    <hr />
                    <div>TODO: Javascript Show</div>
                </>
            ) : null}
        </div>
    );
}
