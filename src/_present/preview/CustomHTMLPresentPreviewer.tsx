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
    namespace JSX {
        // eslint-disable-next-line no-unused-vars
        interface IntrinsicElements {
            ['mini-present-previewer']: CustomElement<CustomHTMLPresentPreviewer,
                'FTScroll' | 'VerseHover' | 'VerseSelect'>;
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
            this.mountPoint.style.maxWidth = (scale * bounds.width) + 'px';
            this.mountPoint.style.height = (scale * bounds.height) + 'px';
            PresentManager.fireResizeEvent();
        }
    }
    static checkSize() {
        document.querySelectorAll<CustomHTMLPresentPreviewer>('mini-present-previewer')
            .forEach((previewer) => {
                previewer.resize();
            });
    }
    connectedCallback() {
        this.resize();
        this.attachShadow({
            mode: 'open',
        }).appendChild(this.mountPoint);
        const root = createRoot(this.mountPoint);
        const idStr = this.getAttribute('presentid');
        if (idStr !== null) {
            this.presentId = +idStr;
            root.render(<MiniPresentApp id={this.presentId} />);
        } else {
            root.render(<div>Error during rendering</div>);
        }
    }
}

customElements.define('mini-present-previewer',
    CustomHTMLPresentPreviewer);
