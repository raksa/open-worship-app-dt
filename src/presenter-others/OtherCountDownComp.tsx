import {
    useStateSettingBoolean,
    useStateSettingString,
} from '../helper/settingHelpers';
import ScreenOtherManager from '../_screen/managers/ScreenOtherManager';
import { getShowingScreenIds, getScreenManagerInstances } from './alertHelpers';
import ScreensRendererComp from './ScreensRendererComp';
import { useScreenOtherManagerEvents } from '../_screen/managers/screenEventHelpers';
import OtherRenderHeaderTitleComp from './OtherRenderHeaderTitleComp';

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
        'alert-date-setting',
        todayString(),
    );
    const [time, setTime] = useStateSettingString<string>(
        'alert-time-setting',
        nowString(),
    );
    return { date, setDate, time, setTime, nowString, todayString };
}

function CountDownOnDatetimeComp() {
    const { date, setDate, time, setTime, nowString, todayString } =
        useTiming();
    const handleDateTimeShowing = (event: any, isForceChoosing = false) => {
        ScreenOtherManager.setCountdown(
            event,
            new Date(date + ' ' + time),
            isForceChoosing,
        );
    };
    const handleContextMenuOpening = (event: any) => {
        handleDateTimeShowing(event, true);
    };
    return (
        <div className="d-flex">
            <div>
                <input
                    type="date"
                    className="form-control"
                    value={date}
                    onChange={(event) => {
                        setDate(event.target.value);
                    }}
                    min={todayString()}
                />
            </div>
            <div>
                <input
                    type="time"
                    className="form-control"
                    value={time}
                    onChange={(event) => {
                        setTime(event.target.value);
                    }}
                    min={nowString()}
                />
            </div>
            <div>
                <button
                    className="btn btn-secondary"
                    onClick={handleDateTimeShowing}
                    onContextMenu={handleContextMenuOpening}
                >
                    Show On DateTime
                </button>
            </div>
        </div>
    );
}

function CountDownTimerComp() {
    const [hours, setHours] = useStateSettingString<string>(
        'alert-hours-setting',
        '0',
    );
    const [minutes, setMinutes] = useStateSettingString<string>(
        'alert-minutes-setting',
        '0',
    );
    const handleTimerShowing = (event: any, isForceChoosing = false) => {
        const targetDatetime = new Date();
        targetDatetime.setSeconds(
            targetDatetime.getSeconds() +
                60 * parseInt(minutes) +
                3600 * parseInt(hours) +
                1,
        );
        ScreenOtherManager.setCountdown(event, targetDatetime, isForceChoosing);
    };
    const handleContextMenuOpening = (event: any) => {
        handleTimerShowing(event, true);
    };
    return (
        <div className="d-flex">
            <div
                className="input-group"
                style={{ width: '120px' }}
                title="Hours"
            >
                <div className="input-group-text">H:</div>
                <input
                    type="number"
                    className="form-control"
                    value={hours}
                    onChange={(event) => {
                        setHours(event.target.value);
                    }}
                    min="0"
                />
            </div>
            <div
                className="input-group"
                style={{ width: '120px' }}
                title="Minutes"
            >
                <div className="input-group-text">M:</div>
                <input
                    type="number"
                    className="form-control"
                    value={minutes}
                    onChange={(event) => {
                        setMinutes(event.target.value);
                    }}
                    min="0"
                    max="59"
                />
            </div>
            <div>
                <button
                    className="btn btn-secondary"
                    onClick={handleTimerShowing}
                    onContextMenu={handleContextMenuOpening}
                >
                    Show Timer
                </button>
            </div>
        </div>
    );
}

export default function OtherCountDownComp() {
    const [isOpened, setIsOpened] = useStateSettingBoolean(
        'other-countdown-opened',
        true,
    );
    useScreenOtherManagerEvents(['update']);
    const showingScreenIds = getShowingScreenIds((data) => {
        return data.countdownData !== null;
    });
    const handleCountdownHiding = (screenId: number) => {
        getScreenManagerInstances(screenId, (screenOtherManager) => {
            screenOtherManager.setCountdownData(null);
        });
    };
    return (
        <div className="card m-2">
            <div
                className={
                    'card-header d-flex justify-content-between' +
                    ' align-items-center'
                }
            >
                <OtherRenderHeaderTitleComp
                    isOpened={isOpened}
                    setIsOpened={setIsOpened}
                >
                    <h4>Timers</h4>
                </OtherRenderHeaderTitleComp>
                {!isOpened ? (
                    <ScreensRendererComp
                        showingScreenIds={showingScreenIds}
                        buttonTitle="Hide Camera"
                        handleOtherHiding={handleCountdownHiding}
                        isMini={true}
                    />
                ) : null}
            </div>
            {isOpened ? (
                <div className="card-body">
                    <div className="m-1">
                        <CountDownOnDatetimeComp />
                    </div>
                    <div className="m-1">
                        <CountDownTimerComp />
                    </div>
                    <div className="m-1">
                        <ScreensRendererComp
                            showingScreenIds={showingScreenIds}
                            buttonTitle="Hide Timer"
                            handleOtherHiding={handleCountdownHiding}
                        />
                    </div>
                </div>
            ) : null}
        </div>
    );
}
