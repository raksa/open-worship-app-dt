import CountDownComp from './CountDownComp';
import MarqueeComp from './MarqueeComp';

export default function PresenterOthersControllerComp() {
    return (
        <div className="w-100 h-100 app-border-white-round">
            <div>
                <MarqueeComp />
            </div>
            <hr />
            <div>
                <CountDownComp />
            </div>
            <hr />
            <div>TODO: Image slides show</div>
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
