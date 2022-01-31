import { useStateSettingBoolean } from '../helper/helpers';
import fullTextPresentHelper from './fullTextPresentHelper';
import ScrollController from './ScrollController';

export const FULL_TEXT_AUTO_SAVE_SETTING = 'full-text-present-auto-show';
export const HIGHLIGHT_HOVER_SETTING = 'full-text-present-highlight';

export default function Utils({ onShow }: { onShow: () => void }) {
    const [isAutoShow, setIsAutoShow] = useStateSettingBoolean(FULL_TEXT_AUTO_SAVE_SETTING);
    const [isHighlightPresent, setIsHighlightPresent] = useStateSettingBoolean(HIGHLIGHT_HOVER_SETTING);
    return (
        <div className="utils border-white-round d-flex d-flex-row align-content-start p-1">
            <div className='d-flex flex-column'>
                <div className="input-group flex-fill">
                    <button className="btn btn-sm btn-info" onClick={onShow}>Show</button>
                    <button className="btn btn-sm btn-danger" onClick={() => {
                        fullTextPresentHelper.hide();
                    }}>Hide</button>
                </div>
                <hr />
                <div className={'form-check form-switch pointer'}
                    onClick={() => setIsAutoShow(!isAutoShow)}>
                    <input className="form-check-input" type="checkbox" checked={isAutoShow}
                        onChange={() => { }} />
                    <label className="form-check-label"><small>Auto Show</small></label>
                </div>
                <div className={'form-check form-switch pointer'}
                    onClick={() => {
                        setIsHighlightPresent(!isHighlightPresent);
                        fullTextPresentHelper.render();
                    }}>
                    <input className="form-check-input" type="checkbox" checked={isHighlightPresent}
                        onChange={() => { }} />
                    <label className="form-check-label"><small>Highlight Hover</small></label>
                </div>
            </div>
            <div className="flex-fill">
                <ScrollController />
            </div>
        </div>
    );
}
