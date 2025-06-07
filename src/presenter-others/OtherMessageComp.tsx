import {
    useStateSettingBoolean,
    useStateSettingString,
} from '../helper/settingHelpers';
import ScreenAlertManager from '../_screen/managers/ScreenAlertManager';
import { useScreenAlertManagerEvents } from '../_screen/managers/screenEventHelpers';
import { getShowingScreenIds, hideAlert } from './alertHelpers';
import ScreensRendererComp from './ScreensRendererComp';
import OtherRenderHeaderTitleComp from './OtherRenderHeaderTitleComp';

export default function OtherMessageComp() {
    const [isOpened, setIsOpened] = useStateSettingBoolean(
        'other-message-opened',
        true,
    );
    useScreenAlertManagerEvents(['update']);
    const [text, setText] = useStateSettingString<string>(
        'marquee-setting',
        '',
    );
    const showingScreenIds = getShowingScreenIds((data) => {
        return data.marqueeData !== null;
    });
    const handleMarqueeHiding = (screenId: number) => {
        hideAlert(screenId, (screenAlertManager) => {
            screenAlertManager.setMarqueeData(null);
        });
    };
    const handleMarqueeShowing = (event: any, isForceChoosing = false) => {
        ScreenAlertManager.setMarquee(event, text, isForceChoosing);
    };
    const handleContextMenuOpening = (event: any) => {
        handleMarqueeShowing(event, true);
    };
    return (
        <div className="card m-2">
            <div className="card-header">
                <OtherRenderHeaderTitleComp
                    isOpened={isOpened}
                    setIsOpened={setIsOpened}
                >
                    <h4>Message</h4>
                </OtherRenderHeaderTitleComp>
            </div>
            {isOpened ? (
                <div className="card-body">
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
                        handleMarqueeHiding={handleMarqueeHiding}
                    />
                </div>
            ) : null}
        </div>
    );
}
