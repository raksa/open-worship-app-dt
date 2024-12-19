import DateTimerComp from './DateTimerComp';
import MarqueeComp from './MarqueeComp';

export default function PresenterAlertControllerComp() {
    return (
        <div className='w-100 h-100 border-white-round'>
            <div>
                <MarqueeComp />
            </div>
            <hr />
            <div>
                <DateTimerComp />
            </div>
        </div>
    );
}
