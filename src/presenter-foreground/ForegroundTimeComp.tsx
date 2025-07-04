import { tz } from 'moment-timezone';

import {
    useStateSettingNumber,
    useStateSettingString,
} from '../helper/settingHelpers';
import ScreenForegroundManager from '../_screen/managers/ScreenForegroundManager';
import {
    getScreenForegroundManagerInstances,
    getShowingScreenIdDataList,
} from './foregroundHelpers';
import ScreensRendererComp from './ScreensRendererComp';
import { useScreenForegroundManagerEvents } from '../_screen/managers/screenEventHelpers';
import { useForegroundPropsSetting } from './propertiesSettingHelpers';
import { genTimeoutAttempt } from '../helper/helpers';
import { ForegroundTimeDataType } from '../_screen/screenTypeHelpers';
import { showAppContextMenu } from '../context-menu/appContextMenuHelpers';
import ForegroundLayoutComp from './ForegroundLayoutComp';

function getSystemTimezoneMinuteOffset() {
    const date = new Date();
    return -date.getTimezoneOffset() / 60;
}

function getMinuteOffsetFromCity(event: any) {
    return new Promise<[string, number] | null>((resolve) => {
        const cityNames = tz
            .names()
            .map((name) => {
                const arr = name.split('/');
                const city = arr[arr.length - 1];
                return [city, name] as [string, string];
            })
            .sort((a, b) => {
                return a[0].localeCompare(b[0]) || a[1].localeCompare(b[1]);
            });
        const promise = showAppContextMenu(
            event,
            cityNames.map(([city, name]) => {
                const title = `${city} (${name})`;
                return {
                    menuElement: title,
                    onSelect: () => {
                        const minuteOffset = tz(name).utcOffset() / 60;
                        resolve([title, minuteOffset]);
                    },
                };
            }),
        );
        promise.promiseDone.then(() => {
            resolve(null);
        });
    });
}

function TimeInSetComp({
    genStyle,
}: Readonly<{
    genStyle: () => React.CSSProperties;
}>) {
    const [cityName, setCityName] = useStateSettingString<string>(
        'foreground-city-name-setting',
        '',
    );
    const [timezoneMinuteOffset, setTimezoneMinuteOffset] =
        useStateSettingNumber(
            'foreground-timezone-minute-offset-setting',
            getSystemTimezoneMinuteOffset(),
        );
    const handleTimeShowing = (event: any, isForceChoosing = false) => {
        if (!isForceChoosing) {
            getShowingScreenIdDataList((data) => {
                return (data.timeDataList ?? []).length > 0;
            }).forEach(([screenId, { timeDataList }]) => {
                getScreenForegroundManagerInstances(
                    screenId,
                    (screenForegroundManager) => {
                        for (const timeData of timeDataList ?? []) {
                            screenForegroundManager.removeTimeData(timeData);
                        }
                    },
                );
            });
        }
        ScreenForegroundManager.addTimeData(
            event,
            {
                timezoneMinuteOffset: timezoneMinuteOffset,
                title: cityName || null,
                extraStyle: genStyle(),
            },
            isForceChoosing,
        );
    };
    const handleContextMenuOpening = (event: any) => {
        handleTimeShowing(event, true);
    };
    return (
        <div className="d-flex flex-column">
            <div className="btn-group">
                <button
                    className="btn btn-outline-secondary"
                    onClick={() => {
                        setTimezoneMinuteOffset(
                            getSystemTimezoneMinuteOffset(),
                        );
                    }}
                >
                    Use Current Timezone
                </button>
                <button
                    className="btn btn-outline-secondary"
                    onClick={async (event) => {
                        const result = await getMinuteOffsetFromCity(event);
                        console.log(result);
                        if (result === null) {
                            return;
                        }
                        setCityName(result[0]);
                        setTimezoneMinuteOffset(result[1]);
                    }}
                >
                    Choose City
                </button>
            </div>
            <hr />
            <div className="d-flex">
                <div className="input-group" style={{ width: '250px' }}>
                    <div className="input-group-text">City:</div>
                    <input
                        type="text"
                        className="form-control"
                        value={cityName}
                        onChange={(event) => {
                            setCityName(event.target.value);
                        }}
                    />
                </div>
                <div className="input-group" style={{ width: '270px' }}>
                    <div className="input-group-text">
                        Timezone Minute Offset:
                    </div>
                    <input
                        type="number"
                        className="form-control"
                        value={timezoneMinuteOffset}
                        onChange={(event) => {
                            setTimezoneMinuteOffset(
                                parseInt(event.target.value),
                            );
                        }}
                    />
                </div>
                <div>
                    <button
                        className="btn btn-secondary"
                        onClick={handleTimeShowing}
                        onContextMenu={handleContextMenuOpening}
                    >
                        `Show Time
                    </button>
                </div>
            </div>
        </div>
    );
}

const attemptTimeout = genTimeoutAttempt(500);
function refreshAllTimes(
    showingScreenIdDataList: [number, ForegroundTimeDataType][],
    extraStyle: React.CSSProperties,
) {
    attemptTimeout(() => {
        showingScreenIdDataList.forEach(([screenId, timeData]) => {
            getScreenForegroundManagerInstances(
                screenId,
                (screenForegroundManager) => {
                    screenForegroundManager.removeTimeData(timeData);
                    screenForegroundManager.addTimeData({
                        ...timeData,
                        extraStyle,
                    });
                },
            );
        });
    });
}

export default function ForegroundTimeComp() {
    useScreenForegroundManagerEvents(['update']);
    const showingScreenIdDataList = getShowingScreenIdDataList((data) => {
        return (data.timeDataList ?? []).length > 0;
    }).reduce(
        (acc, [screenId, { timeDataList }]) => {
            const dataList = (timeDataList ?? []).map((timeData) => {
                return [screenId, timeData] as [number, ForegroundTimeDataType];
            });
            acc.push(...dataList);
            return acc;
        },
        [] as [number, ForegroundTimeDataType][],
    );
    const { genStyle, element: propsSetting } = useForegroundPropsSetting({
        prefix: 'time',
        onChange: (extraStyle) => {
            refreshAllTimes(showingScreenIdDataList, extraStyle);
        },
        isFontSize: true,
    });
    const handleTimeHiding = (
        screenId: number,
        timeData: ForegroundTimeDataType,
    ) => {
        getScreenForegroundManagerInstances(
            screenId,
            (screenForegroundManager) => {
                screenForegroundManager.removeTimeData(timeData);
            },
        );
    };
    const genHidingElement = (isMini: boolean) => (
        <ScreensRendererComp
            showingScreenIdDataList={showingScreenIdDataList}
            buttonTitle="`Hide Time"
            handleForegroundHiding={handleTimeHiding}
            isMini={isMini}
        />
    );
    return (
        <ForegroundLayoutComp
            target="time"
            fullChildHeaders={<h4>`Time</h4>}
            childHeadersOnHidden={genHidingElement(true)}
        >
            {propsSetting}
            <hr />
            <div>
                <TimeInSetComp genStyle={genStyle} />
            </div>
            <div>{genHidingElement(false)}</div>
        </ForegroundLayoutComp>
    );
}
