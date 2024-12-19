import DateTimePickerComp from './DateTimePickerComp';
import MarqueeComp from './MarqueeComp';

export default function PresenterAlertControllerComp() {
    return (
        <div className='w-100 h-100 border-white-round'>
            <div>
                <MarqueeComp />
            </div>
            <hr />
            <div>
                <DateTimePickerComp />
            </div>
        </div>
    );
}
