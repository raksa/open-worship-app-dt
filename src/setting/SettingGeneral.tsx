import { useState } from 'react';
import languages from '../lang';
import { getSetting, setSetting } from '../helper/settingHelper';
import { useTranslation } from 'react-i18next';

export function getSelectedLangLocale() {
    const lc = getSetting('language', languages.en.locale);
    return Object.values(languages).find((l) => l.locale === lc) || languages.en;
}
export function SettingGeneral() {
    const [isSelecting, setIsSelecting] = useState(false);
    const [selected, setSelected] = useState(getSelectedLangLocale());
    const { i18n } = useTranslation();

    return (
        <div className='d-flex'>
            <div className='lang'>
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
                            return (
                                <button key={`${i}`} onClick={() => {
                                    setSelected(l);
                                    setSetting('language', l.locale);
                                    i18n.changeLanguage(l.locale);
                                }} className={
                                    `item btn ${selected.locale === l.locale ? 'btn-info' : 'btn-outline-info'}`}>
                                    {l.name} <div className='icon' dangerouslySetInnerHTML={{ __html: l.flagSVG }} />
                                </button>
                            );
                        })}
                    </div>
                }
            </div>
        </div>
    );
}
