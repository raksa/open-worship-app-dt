import CountDownComp from './CountDownComp';
import MarqueeComp from './MarqueeComp';

export default function PresenterAlertControllerComp() {
    return (
        <div className='w-100 h-100 app-border-white-round'>
            <div>
                <MarqueeComp />
            </div>
            <hr />
            <div>
                <CountDownComp />
            </div>
        </div>
    );
}
