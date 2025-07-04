import {
    useStateSettingBoolean,
    useStateSettingString,
} from '../helper/settingHelpers';
import ScreenForegroundManager from '../_screen/managers/ScreenForegroundManager';
import { useScreenForegroundManagerEvents } from '../_screen/managers/screenEventHelpers';
import {
    getScreenForegroundManagerInstances,
    getShowingScreenIdDataList,
} from './foregroundHelpers';
import ScreensRendererComp from './ScreensRendererComp';
import ForegroundRenderHeaderTitleComp from './ForegroundRenderHeaderTitleComp';

export default function ForegroundMessageComp() {
    const [isOpened, setIsOpened] = useStateSettingBoolean(
        'foreground-message-opened',
        false,
    );
    useScreenForegroundManagerEvents(['update']);
    const [text, setText] = useStateSettingString<string>(
        'marquee-setting',
        '',
    );

    const showingScreenIdDataList = getShowingScreenIdDataList((data) => {
        return data.marqueeData !== null;
    });
    const handleMarqueeHiding = (screenId: number) => {
        getScreenForegroundManagerInstances(
            screenId,
            (screenForegroundManager) => {
                screenForegroundManager.setMarqueeData(null);
            },
        );
    };
    const handleMarqueeShowing = (event: any, isForceChoosing = false) => {
        ScreenForegroundManager.setMarquee(event, text, isForceChoosing);
    };
    const handleContextMenuOpening = (event: any) => {
        handleMarqueeShowing(event, true);
    };
    const genHidingElement = (isMini: boolean) => (
        <ScreensRendererComp
            showingScreenIdDataList={showingScreenIdDataList}
            buttonTitle="`Hide Marquee"
            handleForegroundHiding={handleMarqueeHiding}
            isMini={isMini}
        />
    );
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
                    <h4>`Message</h4>
                </ForegroundRenderHeaderTitleComp>
                {!isOpened ? genHidingElement(true) : null}
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
                            `Show Marquee
                        </button>
                    </div>
                    {genHidingElement(false)}
                </div>
            ) : null}
        </div>
    );
}
