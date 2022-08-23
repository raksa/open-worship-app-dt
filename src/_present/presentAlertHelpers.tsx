import ReactDOMServer from 'react-dom/server';
import { AlertDataType } from './PresentAlertManager';
import PresentManager from './PresentManager';

export function genHtmlAlert(alertData: AlertDataType,
    presentManager: PresentManager) {
    if (alertData.type === 'marquee') {
        const duration = (alertData.marqueeData?.length || 0) / 6;
        const scale = presentManager.height / 768;
        const fontSize = 75 * scale;
        const htmlString = ReactDOMServer.renderToStaticMarkup(<div
            style={{
                position: 'absolute',
                width: '100%',
                left: '0px',
                bottom: '0px',
            }}>
            <style>{`
                    .actor {
                        width: 100%;
                        padding: 3px 0px;
                        margin: 0 auto;
                        overflow: hidden;
                        background-color: blue;
                        color: white;
                        font-size: ${fontSize}px;
                        box-shadow: inset 0 0 10px lightblue;
                    }
                    .actor span {
                        display: inline-block;
                        will-change: transform;
                        width: max-content;
                        padding-left: 100%;
                        animation: moving ${duration}s linear infinite;
                    }
                    .actor span:hover {
                        animation-play-state: paused
                    }
                    @keyframes moving {
                        0% { transform: translate(0, 0); }
                        100% { transform: translate(-100%, 0); }
                    }
                `}</style>
            <p className='actor'>
                <span>{alertData.marqueeData}</span>
            </p>
        </div>);
        const div = document.createElement('div');
        div.innerHTML = htmlString;
        return div.firstChild as HTMLDivElement;
    }
    return document.createElement('div');
}
