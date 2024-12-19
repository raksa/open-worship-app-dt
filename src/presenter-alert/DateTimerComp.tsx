import { useStateSettingString } from '../helper/settingHelpers';
import ScreenAlertManager from '../_screen/ScreenAlertManager';
import { getShowingScreenIds, hideAlert } from './alertHelpers';
import ScreensRendererComp from './ScreensRendererComp';
import { useScreenAlertManagerEvents } from '../_screen/screenEventHelpers';

function useTiming() {
    const nowArray = () => {
        return new Date().toISOString().split('T');
    };
    const todayString = () => {
        return nowArray()[0];
    };
    const nowString = () => {
        const timeStr = nowArray()[1];
        return timeStr.substring(0, timeStr.lastIndexOf(':'));
    };
    const [date, setDate] = useStateSettingString<string>(
        'alert-date-setting', todayString(),
    );
    const [time, setTime] = useStateSettingString<string>(
        'alert-time-setting', nowString(),
    );
    return { date, setDate, time, setTime, nowString, todayString };
}

export default function DateTimerComp() {
    useScreenAlertManagerEvents(['update']);
    const {
        date, setDate, time, setTime, nowString, todayString,
    } = useTiming();
    const showingScreenIds = getShowingScreenIds((data) => {
        return data.countdownData !== null;
    });
    const handleMarqueeHiding = (screenId: number) => {
        hideAlert(screenId, (screenAlertManager) => {
            screenAlertManager.setCountdownData(null);
        });
    };
    return (
        <div>
            <div className='d-flex'>
                <div>
                    <label className='form-label'
                        htmlFor='alert-date'>Date:</label>
                    <input type='date' id='alert-date'
                        className='form-control'
                        value={date} onChange={(event) => {
                            setDate(event.target.value);
                        }}
                        min={todayString()}
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
                        min={nowString()}
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
            <ScreensRendererComp showingScreenIds={showingScreenIds}
                buttonTitle='Hide Timer'
                handleMarqueeHiding={handleMarqueeHiding}
            />
        </div>
    );
}
