import { useStateSettingString } from '../helper/settingHelpers';
import ScreenAlertManager from '../_screen/ScreenAlertManager';
import ScreenManager from '../_screen/ScreenManager';
import { useScreenAlertManagerEvents } from '../_screen/screenEventHelpers';
import ShowingScreenIcon from '../_screen/preview/ShowingScreenIcon';
import { getAlertDataListOnScreenSetting } from '../_screen/screenHelpers';
import { showSimpleToast } from '../toast/toastHelpers';

export default function MarqueeComp() {
    useScreenAlertManagerEvents(['update'], undefined, () => {
        console.log('ScreenAlertManager updated');

    });
    const [text, setText] = useStateSettingString<string>(
        'marquee-setting', ''
    );
    const allAlertDataList = getAlertDataListOnScreenSetting();
    const showingScreenIds = (
        Object.entries(allAlertDataList).filter(([_, data]) => {
            return data.marqueeData !== null;
        }).map(([key]) => {
            return parseInt(key, 10);
        })
    );
    const handleMarqueeHiding = (screenId: number) => {
        const screenManager = ScreenManager.getInstanceByKey(
            screenId.toString(),
        );
        if (screenManager === null) {
            showSimpleToast('ScreenManager not found', 'error');
            return;
        }
        const { screenAlertManager } = screenManager;
        screenAlertManager.setMarqueeData(null);
    };
    return (
        <div>
            <div className='form-floating'>
                <textarea id='marquee-textarea'
                    className='form-control'
                    cols={30} rows={20} value={text}
                    onChange={(event) => {
                        setText(event.target.value);
                    }}
                    placeholder='Leave a marquee text here'
                />
                <label htmlFor='marquee-textarea'>Marquee</label>
                <button className='btn btn-secondary'
                    onClick={(event) => {
                        ScreenAlertManager.setMarquee(event, text);
                    }}>
                    Show Marquee
                </button>
            </div>
            <div className='d-flex mt-2'>
                {showingScreenIds.map((screenId) => {
                    return (
                        <div className='d-flex' key={screenId}>
                            <ShowingScreenIcon screenId={screenId} />
                            <button className='btn btn-secondary'
                                onClick={
                                    handleMarqueeHiding.bind(null, screenId)
                                }>
                                Hide Marquee
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
