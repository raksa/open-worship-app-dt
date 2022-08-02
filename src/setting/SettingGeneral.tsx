import { useState } from 'react';
import languages from '../lang';
import { getSetting, setSetting } from '../helper/settingHelper';
import { useTranslation } from 'react-i18next';
import { useDisplay } from '../event/PresentEventListener';
import { saveDisplaySetting } from '../helper/displayHelper';
import { clearWidgetSizeSetting } from '../resize-actor/flexSizeHelpers';

export function getSelectedLangLocale() {
    const lc = getSetting('language', languages.en.locale);
    return Object.values(languages).find((l) => l.locale === lc) || languages.en;
}
export default function SettingGeneral() {
    return (
        <div>
            <Language />
            <hr />
            <Display />
            <hr />
            <button className='btn btn-info' onClick={() => {
                clearWidgetSizeSetting();
                location.reload();
            }}>Reset Widgets Size</button>
        </div>
    );
}

function Language() {
    const [isSelecting, setIsSelecting] = useState(false);
    const [selected, setSelected] = useState(getSelectedLangLocale());
    const { i18n } = useTranslation();

    return (
        <div className='card lang'>
            <div className='card-header'>Language</div>
            <div className='card-body'>
                <button className={
                    'btn btn-info flag-item'}
                    onClick={() => { setIsSelecting(!isSelecting); }}>
                    {selected.name}
                    <div className='icon' dangerouslySetInnerHTML={{
                        __html: selected.flagSVG,
                    }} />
                </button>
                {isSelecting &&
                    <div className='options d-flex flex-wrap'>
                        {Object.values(languages).map((l, i) => {
                            const btnType = selected.locale === l.locale ? 'btn-info' : 'btn-outline-info';
                            return (
                                <button key={`${i}`}
                                    onClick={() => {
                                        setSelected(l);
                                        setSetting('language', l.locale);
                                        i18n.changeLanguage(l.locale);
                                    }} className={`item btn ${btnType}`}>
                                    {l.name} <div className='icon'
                                        dangerouslySetInnerHTML={{
                                            __html: l.flagSVG,
                                        }} />
                                </button>
                            );
                        })}
                    </div>
                }
            </div>
        </div>
    );
}

function Display() {
    const { displays, presentDisplay } = useDisplay();
    return (
        <div className='card'>
            <div className='card-header'>Display</div>
            <div className='card-body'>
                <div className='input-group'>
                    <span >Present Display:</span>
                    <select className='form-select' aria-label='Default select example'
                        value={presentDisplay.id} onChange={(e) => {
                            saveDisplaySetting({
                                presentDisplayId: e.target.value,
                            });
                        }}>
                        {displays.map(({ id, bounds }, i) => {
                            return (
                                <option key={i} value={id}>
                                    screen{i} {bounds.width}x{bounds.height}</option>
                            );
                        })}
                    </select>
                </div>
            </div>
        </div>
    );
}
