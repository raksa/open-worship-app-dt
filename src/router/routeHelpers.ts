import appProvider from '../server/appProvider';

export type TabOptionType = {
    title: string,
    routePath: string,
}

export enum WindowModEnum {
    Editor = 0,
    presenter = 1,
    reader = 2,
}

export const editorTab: TabOptionType = {
    title: 'Editor↗️',
    routePath: appProvider.editorHomePage,
};
export const presenterTab: TabOptionType = {
    title: 'Presenter↗️',
    routePath: appProvider.readerHomePage,
};
export const readerTab: TabOptionType = {
    title: 'Reader↗️',
    routePath: appProvider.readerHomePage,
};

export function goToPath(pathname: string) {
    const url = new URL(window.location.href);
    url.pathname = pathname;
    window.location.href = url.href;
}
