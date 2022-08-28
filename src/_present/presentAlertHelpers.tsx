import ReactDOMServer from 'react-dom/server';
import { AlertDataType } from './PresentAlertManager';
import PresentManager from './PresentManager';

const alertTypeList = ['marquee', 'countdown', 'toast'] as const;
export type AlertType = typeof alertTypeList[number];

const classNameMapper = {
    marquee: 'marquee-actor',
    countdown: 'countdown-actor',
    toast: 'toast-actor',
};

export function genHtmlAlert(alertData: AlertDataType,
    presentManager: PresentManager) {
    if (alertData.marqueeData !== null) {
        const { text } = alertData.marqueeData;
        const duration = (text.length || 0) / 6;
        const scale = presentManager.height / 768;
        const fontSize = 75 * scale;
        const actorClass = classNameMapper.marquee;
        const htmlString = ReactDOMServer.renderToStaticMarkup(<div
            data-alert-cn={actorClass}
            style={{
                position: 'absolute',
                width: '100%',
                left: '0px',
                bottom: '0px',
            }}>
            <style>{`
                    .${actorClass} {
                        width: 100%;
                        padding: 3px 0px;
                        margin: 0 auto;
                        overflow: hidden;
                        background-color: blue;
                        color: white;
                        font-size: ${fontSize}px;
                        box-shadow: inset 0 0 10px lightblue;
                        will-change: transform;
                        transform: translateY(100%);
                        animation: from-bottom 500ms ease-in forwards;
                    }
                    .${actorClass}.out {
                        animation: to-bottom 500ms ease-out forwards;
                    }
                    .${actorClass} span {
                        display: inline-block;
                        will-change: transform;
                        width: max-content;
                    }
                    .${actorClass}.moving span {
                        padding-left: 100%;
                        animation-duration: ${duration}s;
                        animation-timing-function: linear;
                        animation-delay: 0s;
                        animation-iteration-count: infinite;
                        animation-direction: normal;
                        animation-fill-mode: none;
                        animation-play-state: running;
                        animation-name: moving;
                    }
                    @keyframes moving {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-100%); }
                    }
                    @keyframes from-bottom {
                        0% { transform: translateY(100%); }
                        100% { transform: translateY(0); }
                    }
                    @keyframes to-bottom {
                        0% { transform: translateY(0); }
                        100% { transform: translateY(100%); }
                    }
                `}</style>
            <p className={`marquee ${actorClass}`}>
                <span>{text}</span>
            </p>
        </div>);
        const div = document.createElement('div');
        div.innerHTML = htmlString;
        return div.firstChild as HTMLDivElement;
    }
    return document.createElement('div');
}

export function removeAlert(div: ChildNode) {
    const remove = () => div.remove();
    if (div instanceof HTMLDivElement
        && div.dataset['alertCn'] !== undefined) {
        const actorClassName = div.dataset['alertCn'];
        const targets = div.getElementsByClassName(actorClassName);
        Array.from(targets).forEach((target) => {
            target.classList.add('out');
        });
        setTimeout(remove, 600);
    } else {
        remove();
    }
}
