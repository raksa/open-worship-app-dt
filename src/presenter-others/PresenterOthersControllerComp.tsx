import CountDownComp from './CountDownComp';
import ImagesShowComp from './ImagesShowComp';
import MarqueeComp from './MarqueeComp';

export default function PresenterOthersControllerComp() {
    return (
        <div
            className="w-100 h-100 app-border-white-round"
            style={{
                overflowY: 'auto',
            }}
        >
            <div>
                <MarqueeComp />
            </div>
            <hr />
            <div>
                <CountDownComp />
            </div>
            <hr />
            <ImagesShowComp />
            <hr />
            <div>TODO: Video show</div>
            <hr />
            <div>TODO: Sound show</div>
            <hr />
            <div>TODO: Camera Show</div>
            <hr />
            <div>TODO: Javascript Show</div>
        </div>
    );
}
