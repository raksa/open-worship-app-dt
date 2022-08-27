import { useStateSettingString } from '../helper/settingHelper';
import PresentAlertManager from '../_present/PresentAlertManager';

export default function PresentAlertController() {
    return (
        <div id='present-alert-controller'
            className='w-100 h-100 border-white-round'>
            <div>
                <Marquee />
            </div>
            <hr />
        </div>
    );
}

function Marquee() {
    const [text, setText] = useStateSettingString<string>('marquee-setting', '');
    return (
        <div className='form-floating'>
            <textarea id='marquee-textarea'
                className='form-control'
                cols={30} rows={10} value={text}
                onChange={(event) => {
                    setText(event.target.value);
                }}
                placeholder='Leave a marquee text here' />
            <label htmlFor='marquee-textarea'>Marquee</label>
            <button className='btn btn-secondary'
            onClick={(event) => {
                PresentAlertManager.setMarquee(text, event);
            }}>Show</button>
        </div>
    );
}
