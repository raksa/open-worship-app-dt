import { DOMAttributes } from 'react';
import { createRoot } from 'react-dom/client';
import { getAllDisplays } from '../../server/displayHelper';
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
    presentId: number;
    mountPoint: HTMLDivElement;
    constructor() {
        super();
        this.presentId = Number(this.getAttribute('presentId') || 0);
        this.mountPoint = document.createElement('div');
    }
    resize() {
        if (this.parentElement) {
            const appInfo = getAllDisplays();
            const bounds = appInfo.presentDisplay.bounds;
            const scale = this.parentElement.clientWidth / bounds.width;
            this.mountPoint.style.maxWidth = (scale * bounds.width) + 'px';
            this.mountPoint.style.height = (scale * bounds.height) + 'px';
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
        root.render(<MiniPresentApp id={this.presentId} />);
    }
}

customElements.define('mini-present-previewer',
    CustomHTMLPresentPreviewer);
