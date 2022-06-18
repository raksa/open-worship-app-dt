import { removePX } from '../helper/helpers';
import HTML2ReactChild from './HTML2ReactChild';

export enum HAlignmentEnum {
    Left = 'left',
    Center = 'center',
    Right = 'right',
}
export enum VAlignmentEnum {
    Top = 'start',
    Center = 'center',
    Bottom = 'end',
}

export default class HTML2React {
    width: number;
    height: number;
    children: HTML2ReactChild[];
    constructor({ width, height, children }: {
        width: number, height: number, children: HTML2ReactChild[],
    }) {
        this.width = width;
        this.height = height;
        this.children = children;
    }
    static parseHTML(html: string): HTML2React {
        const div = document.createElement('div');
        div.innerHTML = html;
        const mainDiv = div.firstChild as HTMLDivElement;
        const children = Array.from(mainDiv.children).map((ele): HTML2ReactChild => {
            return HTML2ReactChild.parseHTML(ele.outerHTML);
        });
        return new HTML2React({
            width: removePX(mainDiv.style.width) || 500,
            height: removePX(mainDiv.style.height) || 150,
            children,
        });
    }
    get html() {
        const div = document.createElement('div');
        const newHtml = `<div style="width: ${this.width}px; height: ${this.height}px;">` +
            `${this.children.map((child) => child.htmlString).join('')}</div>`;
        div.innerHTML = newHtml;
        return div.firstChild as HTMLDivElement;
    }
    get htmlString() {
        return this.html.outerHTML;
    }
}
