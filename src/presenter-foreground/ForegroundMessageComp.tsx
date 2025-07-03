import {
    useStateSettingBoolean,
    useStateSettingString,
} from '../helper/settingHelpers';
import ScreenForegroundManager from '../_screen/managers/ScreenForegroundManager';
import { useScreenForegroundManagerEvents } from '../_screen/managers/screenEventHelpers';
import {
    getShowingScreenIds,
    getScreenManagerInstances,
} from './foregroundHelpers';
import ScreensRendererComp from './ScreensRendererComp';
import ForegroundRenderHeaderTitleComp from './ForegroundRenderHeaderTitleComp';

export default function ForegroundMessageComp() {
    const [isOpened, setIsOpened] = useStateSettingBoolean(
        'other-message-opened',
        false,
    );
    useScreenForegroundManagerEvents(['update']);
    const [text, setText] = useStateSettingString<string>(
        'marquee-setting',
        '',
    );
    const showingScreenIds = getShowingScreenIds((data) => {
        return data.marqueeData !== null;
    });
    const handleMarqueeHiding = (screenId: number) => {
        getScreenManagerInstances(screenId, (screenForegroundManager) => {
            screenForegroundManager.setMarqueeData(null);
        });
    };
    const handleMarqueeShowing = (event: any, isForceChoosing = false) => {
        ScreenForegroundManager.setMarquee(event, text, isForceChoosing);
    };
    const handleContextMenuOpening = (event: any) => {
        handleMarqueeShowing(event, true);
    };
    return (
        <div className="card m-2">
            <div
                className={
                    'card-header d-flex justify-content-between' +
                    ' align-items-center'
                }
            >
                <ForegroundRenderHeaderTitleComp
                    isOpened={isOpened}
                    setIsOpened={setIsOpened}
                >
                    <h4>Message</h4>
                </ForegroundRenderHeaderTitleComp>
                {!isOpened ? (
                    <ScreensRendererComp
                        showingScreenIds={showingScreenIds}
                        buttonTitle="Hide Camera"
                        handleForegroundHiding={handleMarqueeHiding}
                        isMini={true}
                    />
                ) : null}
            </div>
            {isOpened ? (
                <div className="card-body">
                    <div>
                        <button
                            className="btn btn-sm btn-info"
                            onClick={() => {
                                // Sunday September 24, 2023
                                const date = new Date();
                                const formattedDate = date.toLocaleString(
                                    'en-US',
                                    {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    },
                                );
                                setText(formattedDate);
                            }}
                        >
                            Date
                        </button>
                    </div>
                    <div className="form-floating">
                        <textarea
                            id="marquee-textarea"
                            className="form-control"
                            cols={30}
                            rows={20}
                            value={text}
                            onChange={(event) => {
                                setText(event.target.value);
                            }}
                            placeholder="Leave a marquee text here"
                        />
                        <label htmlFor="marquee-textarea">Marquee</label>
                        <button
                            className="btn btn-secondary"
                            onClick={handleMarqueeShowing}
                            onContextMenu={handleContextMenuOpening}
                        >
                            Show Marquee
                        </button>
                    </div>
                    <ScreensRendererComp
                        showingScreenIds={showingScreenIds}
                        buttonTitle="Hide Marquee"
                        handleForegroundHiding={handleMarqueeHiding}
                    />
                </div>
            ) : null}
        </div>
    );
}
