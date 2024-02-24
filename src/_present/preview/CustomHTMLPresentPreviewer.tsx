import { DOMAttributes } from 'react';

import { createRoot } from 'react-dom/client';
import PresentManager from '../PresentManager';
import MiniPresentApp from './MiniPresentApp';

type CustomEvents<K extends string> = {
    // eslint-disable-next-line no-unused-vars
    [key in K]: (event: CustomEvent) => void;
};
type CustomElement<T, K extends string> = Partial<T & DOMAttributes<T> & {
    children: any,
} & CustomEvents<`on${K}`>>;
declare global {
    // eslint-disable-next-line no-unused-vars
    namespace React.JSX {
        // eslint-disable-next-line no-unused-vars
        interface IntrinsicElements {
            ['mini-present-previewer']: CustomElement<
                CustomHTMLPresentPreviewer, 'FTScroll' |
                'VerseHover' | 'VerseSelect'
            >;
        }
    }
}

export default class CustomHTMLPresentPreviewer extends HTMLElement {
    mountPoint: HTMLDivElement;
    presentId: number;
    constructor() {
        super();
        this.presentId = -1;
        this.mountPoint = document.createElement('div');
        this.mountPoint.style.overflow = 'hidden';
    }
    resize() {
        if (this.parentElement) {
            const display = PresentManager.getDefaultPresentDisplay();
            const bounds = display.bounds;
            const scale = this.parentElement.clientWidth / bounds.width;
            const width = scale * bounds.width;
            const height = scale * bounds.height;
            this.mountPoint.style.width = `${width}px`;
            this.mountPoint.style.height = `${height}px`;
            if (this.presentId > -1) {
                const presentManager = PresentManager.getInstance(
                    this.presentId,
                );
                if (presentManager === null) {
                    return;
                }
                presentManager.width = width;
                presentManager.height = height;
            }
            PresentManager.fireResizeEvent();
        }
    }
    connectedCallback() {
        this.attachShadow({
            mode: 'open',
        }).appendChild(this.mountPoint);
        const root = createRoot(this.mountPoint);
        const idStr = this.getAttribute('presentid');
        if (idStr !== null) {
            this.presentId = +idStr;
            const presentManager = PresentManager.getInstance(this.presentId);
            if (presentManager === null) {
                return;
            }
            presentManager.registerEventListener(['resize'], () => {
                this.resize();
            });
            this.resize();
            root.render(<MiniPresentApp id={this.presentId} />);
        } else {
            root.render(<div>Error during rendering</div>);
        }
    }
}

customElements.define('mini-present-previewer',
    CustomHTMLPresentPreviewer);
