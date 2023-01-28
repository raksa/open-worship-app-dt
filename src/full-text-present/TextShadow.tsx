import './TextShadow.scss';

import { useEffect } from 'react';
import PresentFTManager from '../_present/PresentFTManager';
import { AppColorType } from '../others/color/colorHelpers';

function genShadow1(color1: string, color2: string) {
    const style = `color: ${color1}; text-shadow: 2px 2px 0 ${color2}, `
        + `2px -2px 0 ${color2}, -2px 2px 0 ${color2}, -2px -2px 0 `
        + `${color2}, 2px 0px 0 ${color2}, 0px 2px 0 ${color2}, -2px 0px `
        + `0 ${color2}, 0px -2px 0 ${color2};`;
    return `
    <div class="ow-outline-demo" style="color: #ffffff">
        None
    </div>
    <div class="ow-outline-demo" style="${style}">
        Outline1
    </div>
`;
}

export default function TextShadow() {
    useEffect(() => {
        const divList = document.querySelectorAll<HTMLDivElement>(
            '.ow-outline-demo');
        const listenList = Array.from(divList).map((d) => {
            const listener = () => {
                PresentFTManager.applyTextStyle({
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
                __html: genShadow1(color1, color2),
            }}>
            </div>
        </div>
    );
}
