import { useStateSettingString } from '../helper/settingHelpers';
import ScreenAlertManager from '../_screen/ScreenAlertManager';

export default function DateTimePickerComp() {
    const nowArr = () => {
        return new Date().toISOString().split('T');
    };
    const todayStr = () => nowArr()[0];
    const nowStr = () => {
        const timeStr = nowArr()[1];
        return timeStr.substring(0, timeStr.lastIndexOf(':'));
    };
    const [date, setDate] = useStateSettingString<string>(
        'alert-date-setting', todayStr(),
    );
    const [time, setTime] = useStateSettingString<string>(
        'alert-time-setting', nowStr(),
    );
    return (
        <>
            <div className='d-flex'>
                <div>
                    <label className='form-label'
                        htmlFor='alert-date'>Date:</label>
                    <input type='date' id='alert-date'
                        className='form-control'
                        value={date} onChange={(event) => {
                            setDate(event.target.value);
                        }}
                        min={todayStr()}
                    />
                </div>
                <div>
                    <label className='form-label'
                        htmlFor='alert-time'>Time:</label>
                    <input type='time' id='alert-time'
                        className='form-control'
                        value={time} onChange={(event) => {
                            setTime(event.target.value);
                        }}
                        min={nowStr()}
                    />
                </div>
                <br />
            </div>
            <div>
                <button className='btn btn-secondary'
                    onClick={(event) => {
                        ScreenAlertManager.setCountdown(
                            event, new Date(date + ' ' + time));
                    }}>
                    Show Time
                </button>
            </div>
        </>
    );
}
