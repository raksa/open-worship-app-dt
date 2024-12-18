import { DOMAttributes } from 'react';

import { createRoot } from 'react-dom/client';
import ScreenManager from '../ScreenManager';
import MiniScreenApp from './MiniScreenApp';

const HTML_TAG_NAME = 'mini-screen-previewer-custom-html';

type CustomEvents<K extends string> = {
    [key in K]: (event: CustomEvent) => void;
};
type CustomElement<T, K extends string> = Partial<T & DOMAttributes<T> & {
    children: any,
} & CustomEvents<`on${K}`>>;
declare global {
    namespace React.JSX {
        interface IntrinsicElements {
            [HTML_TAG_NAME]: (
                CustomElement<
                    CustomHTMLScreenPreviewer, 'FTScroll' | 'VerseHover' |
                    'VerseSelect'
                >
            );
        }
    }
}

export default class CustomHTMLScreenPreviewer extends HTMLElement {
    mountPoint: HTMLDivElement;
    screenId: number;
    constructor() {
        super();
        this.screenId = -1;
        this.mountPoint = document.createElement('div');
        this.mountPoint.style.overflow = 'hidden';
    }
    resize() {
        if (this.parentElement) {
            const display = ScreenManager.getDefaultScreenDisplay();
            const bounds = display.bounds;
            const scale = this.parentElement.clientWidth / bounds.width;
            const width = scale * bounds.width;
            const height = scale * bounds.height;
            this.mountPoint.style.width = `${width}px`;
            this.mountPoint.style.height = `${height}px`;
            if (this.screenId > -1) {
                const screenManager = ScreenManager.getInstance(
                    this.screenId,
                );
                if (screenManager === null) {
                    return;
                }
                screenManager.width = width;
                screenManager.height = height;
            }
            ScreenManager.fireResizeEvent();
        }
    }
    connectedCallback() {
        this.attachShadow({
            mode: 'open',
        }).appendChild(this.mountPoint);
        const root = createRoot(this.mountPoint);
        const screenManager = ScreenManager.getInstance(this.screenId);
        if (screenManager === null) {
            return;
        }
        screenManager.registerEventListener(['resize'], () => {
            this.resize();
        });
        this.resize();
        root.render(<MiniScreenApp id={this.screenId} />);
    }
}

customElements.define(HTML_TAG_NAME, CustomHTMLScreenPreviewer);
