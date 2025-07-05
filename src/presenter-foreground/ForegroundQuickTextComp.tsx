import {
    useStateSettingNumber,
    useStateSettingString,
} from '../helper/settingHelpers';
import ScreenForegroundManager from '../_screen/managers/ScreenForegroundManager';
import {
    getScreenForegroundManagerInstances,
    getForegroundShowingScreenIdDataList,
} from './foregroundHelpers';
import ScreensRendererComp from './ScreensRendererComp';
import { useScreenForegroundManagerEvents } from '../_screen/managers/screenEventHelpers';
import { useForegroundPropsSetting } from './propertiesSettingHelpers';
import { genTimeoutAttempt } from '../helper/helpers';
import { ForegroundQuickTextDataType } from '../_screen/screenTypeHelpers';
import ForegroundLayoutComp from './ForegroundLayoutComp';
import { renderMarkdown } from '../lyric-list/markdownHelpers';

const attemptTimeout = genTimeoutAttempt(500);
function refreshAllQuickText(
    showingScreenIds: [number, ForegroundQuickTextDataType][],
    extraStyle: React.CSSProperties,
) {
    attemptTimeout(() => {
        showingScreenIds.forEach(([screenId, data]) => {
            getScreenForegroundManagerInstances(
                screenId,
                (screenForegroundManager) => {
                    screenForegroundManager.setQuickTextData(null);
                    screenForegroundManager.setQuickTextData({
                        ...data,
                        extraStyle,
                    });
                },
            );
        });
    });
}

export default function ForegroundQuickTextComp() {
    useScreenForegroundManagerEvents(['update']);
    const [markdownText, setMarkdownText] = useStateSettingString<string>(
        'foreground-quick-text-setting',
        '## This is Title\n\ntext **bold** and *italic*.',
    );
    const [timeSecondToLive, setTimeSecondToLive] = useStateSettingNumber(
        'foreground-quick-text-time-to-live',
        3,
    );

    const showingScreenIdDataList = getForegroundShowingScreenIdDataList(
        (data) => {
            return data.quickTextData !== null;
        },
    ).map(([screenId, data]) => {
        return [screenId, data.quickTextData] as [
            number,
            ForegroundQuickTextDataType,
        ];
    });
    const { genStyle, element: propsSetting } = useForegroundPropsSetting({
        prefix: 'quick-text',
        onChange: (extraStyle) => {
            refreshAllQuickText(showingScreenIdDataList, extraStyle);
        },
        isFontSize: true,
    });
    const handleHiding = (screenId: number) => {
        getScreenForegroundManagerInstances(
            screenId,
            (screenForegroundManager) => {
                screenForegroundManager.setQuickTextData(null);
            },
        );
    };
    const handleShowing = async (event: any, isForceChoosing = false) => {
        const htmlText = await renderMarkdown(markdownText);
        ScreenForegroundManager.setQuickText(
            event,
            htmlText.html,
            timeSecondToLive,
            genStyle(),
            isForceChoosing,
        );
    };
    const handleContextMenuOpening = (event: any) => {
        handleShowing(event, true);
    };
    const genHidingElement = (isMini: boolean) => (
        <ScreensRendererComp
            showingScreenIdDataList={showingScreenIdDataList}
            buttonTitle="`Hide Quick Text"
            handleForegroundHiding={handleHiding}
            isMini={isMini}
        />
    );
    return (
        <ForegroundLayoutComp
            target="quick-text"
            fullChildHeaders={<h4>`Quick Text</h4>}
            childHeadersOnHidden={genHidingElement(true)}
        >
            {propsSetting}
            <hr />
            <div className="d-flex flex-column gap-1">
                <div
                    className="input-group input-group-sm"
                    title="Stage number"
                    style={{
                        width: '250px',
                    }}
                >
                    <small>`Time Second to Live:</small>
                    <input
                        className="form-control"
                        type="number"
                        min="1"
                        value={timeSecondToLive}
                        onChange={(e) => {
                            setTimeSecondToLive(parseInt(e.target.value, 10));
                        }}
                    />
                </div>
                <div className="form-floating">
                    <textarea
                        id="quick-text-textarea"
                        className="form-control"
                        cols={150}
                        rows={20}
                        value={markdownText}
                        onChange={(event) => {
                            setMarkdownText(event.target.value);
                        }}
                        placeholder="Leave a markdown text here"
                    />
                    <label htmlFor="quick-text-textarea">Markdown</label>
                    <button
                        className="btn btn-secondary"
                        onClick={handleShowing}
                        onContextMenu={handleContextMenuOpening}
                    >
                        `Show Quick Text
                    </button>
                </div>
            </div>
            <div>{genHidingElement(false)}</div>
        </ForegroundLayoutComp>
    );
}
