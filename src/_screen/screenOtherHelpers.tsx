import ReactDOMServer from 'react-dom/server';
import CountdownController from './managers/CountdownController';
import { getHTMLChild } from '../helper/helpers';
import ScreenManagerBase from './managers/ScreenManagerBase';

const _alertTypeList = ['countdown', 'marquee', 'camera', 'toast'] as const;
export type AlertType = (typeof _alertTypeList)[number];

const classNameMapper = {
    countdown: 'countdown-actor',
    marquee: 'marquee-actor',
    camera: 'camera-actor',
    toast: 'toast-actor',
};

export function genHtmlAlertMarquee(
    marqueeData: { text: string },
    screenManagerBase: ScreenManagerBase,
) {
    const { text } = marqueeData;
    const duration = text.length / 6;
    const scale = screenManagerBase.height / 768;
    const fontSize = 75 * scale;
    const actorClass = classNameMapper.marquee;
    const htmlString = ReactDOMServer.renderToStaticMarkup(
        <div
            data-alert-cn={actorClass}
            style={{
                position: 'absolute',
                width: '100%',
                left: '0px',
                bottom: '0px',
            }}
        >
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
        </div>,
    );
    const div = document.createElement('div');
    div.innerHTML = htmlString;
    return getHTMLChild<HTMLDivElement>(div, 'div');
}

export function genHtmlAlertCountdown(
    countdownData: { dateTime: Date },
    screenManagerBase: ScreenManagerBase,
) {
    const { dateTime } = countdownData;
    const scale = screenManagerBase.height / 768;
    const fontSize = 100 * scale;
    const chunkSize = Math.floor(fontSize / 10);
    const actorClass = classNameMapper.countdown;
    const htmlString = ReactDOMServer.renderToStaticMarkup(
        <div
            data-alert-cn={actorClass}
            style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: `${fontSize}px`,
                color: 'white',
            }}
        >
            <style>{`
                .${actorClass} {
                    background-color: blue;
                    box-shadow:
                        0 0 0 ${chunkSize}px hsl(0, 0%, 80%),
                        0 0 0 ${chunkSize}px hsl(0, 0%, 90%);
                    display: flex;
                    justify-content: center;
                    padding: ${chunkSize}px;
                }
                .${actorClass} div {
                    text-align: center;
                    width: ${fontSize * 1.3}px;
                }
                .${actorClass} #second {
                    text-align: left;
                }
                .${actorClass}.out {
                    display: none;
                }
            `}</style>
            <div className={`countdown ${actorClass}`}>
                <div id="hour">00</div>:<div id="minute">00</div>:
                <div id="second">00</div>
            </div>
        </div>,
    );
    const div = document.createElement('div');
    div.innerHTML = htmlString;
    const divContainer = getHTMLChild<HTMLDivElement>(div, 'div');
    CountdownController.init(divContainer, dateTime);
    return divContainer;
}

export function removeAlert(div: ChildNode) {
    const remove = () => div.remove();
    if (div instanceof HTMLDivElement && div.dataset['alertCn'] !== undefined) {
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

export function checkIsCountdownDatesEq(
    date1: Date | null,
    date2: Date | null,
) {
    if (date1 === null || date2 === null) {
        return false;
    }
    const toDateArr = (date: Date) => {
        return date.toISOString().split('T');
    };
    const toString = (date: Date) => {
        const dateStr = toDateArr(date)[0];
        const timeStrFull = toDateArr(date)[1];
        const timeStr = timeStrFull.substring(0, timeStrFull.lastIndexOf(':'));
        return `${dateStr} ${timeStr}`;
    };
    return toString(date1) === toString(date2);
}

export function getAndShowMedia({
    id,
    width,
    extraStyle,
    container,
}: {
    container: HTMLElement;
    width?: number;
    extraStyle?: React.CSSProperties;
    id: string;
}) {
    const constraints = {
        audio: false,
        video: { width },
        id,
    };

    navigator.mediaDevices
        .getUserMedia(constraints)
        .then((mediaStream) => {
            const video = document.createElement('video');
            video.srcObject = mediaStream;
            video.onloadedmetadata = () => {
                video.play();
            };
            if (width !== undefined) {
                video.style.width = `${width}px`;
            }
            Object.assign(video.style, extraStyle ?? {});
            container.innerHTML = '';
            container.appendChild(video);
            return () => {
                const tracks = mediaStream.getVideoTracks();
                tracks.forEach((track) => {
                    track.stop();
                });
            };
        })
        .catch((err) => {
            // always check for errors at the end.
            console.error(`${err.name}: ${err.message}`);
        });
}
