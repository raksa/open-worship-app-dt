import './TextShadow.scss';

import { useEffect } from 'react';
import fullTextPresentHelper from './fullTextPresentHelper';
import { AppColorType } from '../others/ColorPicker';


export default function TextShadow() {
    useEffect(() => {
        const divList = document.querySelectorAll<HTMLDivElement>('.ow-outline-demo');
        const listenList = Array.from(divList).map((d) => {
            const listener = () => {
                fullTextPresentHelper.setStyle({
                    textShadow: d.style.textShadow,
                    color: d.style.color as AppColorType,
                });
            };
            d.addEventListener('click', listener);
            return { d, listener };
        });
        return () => {
            listenList.forEach((listen) => {
                listen.d.removeEventListener('click', listen.listener);
            });
        };
    });
    const color1 = '#ffffff';
    const color2 = '#4054b2';
    return (
        <div className='card-body'>
            <div className='text-shadow' dangerouslySetInnerHTML={{
                __html: `
            <div class="ow-outline-demo" style="color: ${color1}; text-shadow: 2px 2px 0 ${color2}, 2px -2px 0 ${color2}, -2px 2px 0 ${color2}, -2px -2px 0 ${color2}, 2px 0px 0 ${color2}, 0px 2px 0 ${color2}, -2px 0px 0 ${color2}, 0px -2px 0 ${color2};">
                Outline1
            </div>
        `}}>
            </div>
        </div>
    );
}
