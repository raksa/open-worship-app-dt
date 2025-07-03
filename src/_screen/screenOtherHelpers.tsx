import ReactDOMServer from 'react-dom/server';
import CountdownController from './managers/CountdownController';
import { getHTMLChild } from '../helper/helpers';
import ScreenManagerBase from './managers/ScreenManagerBase';
import { handleError } from '../helper/errorHelpers';

const classNameMapper = {
    countdown: 'countdown-actor',
    marquee: 'marquee-actor',
    camera: 'camera-actor',
    toast: 'toast-actor',
};

export function genHtmlForegroundMarquee(
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
                    color: white;
                    background-color: rgba(0, 12, 100, 0.5);
                    backdrop-filter: blur(5px);
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
    const marqueeDiv = getHTMLChild<HTMLDivElement>(div, 'div');
    marqueeDiv.querySelectorAll('.marquee').forEach((element: any) => {
        if (element.offsetWidth < element.scrollWidth) {
            element.classList.add('moving');
        }
    });
    return marqueeDiv;
}

export function genHtmlForegroundCountdown(countdownData: {
    dateTime: Date;
    extraStyle?: React.CSSProperties;
}) {
    const { dateTime } = countdownData;
    const actorClass = classNameMapper.countdown;
    const htmlString = ReactDOMServer.renderToStaticMarkup(
        <div
            data-alert-cn={actorClass}
            style={{
                color: 'white',
                backgroundColor: 'rgba(0, 12, 100, 0.7)',
                backdropFilter: 'blur(5px)',
                ...(countdownData.extraStyle ?? {}),
            }}
        >
            <style>{`
                .${actorClass} {
                    display: flex;
                    justify-content: center;
                }
                .${actorClass} div {
                    text-align: center;
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

export async function getAndShowMedia({
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
    try {
        const mediaStream =
            await navigator.mediaDevices.getUserMedia(constraints);
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
    } catch (error) {
        handleError(error);
    }
}
