import { showAppAlert } from '../alert/alertHelpers';
import appProvider from '../server/appProvider';
import Slide from '../slide-list/Slide';

export type TabOptionType = {
    title: string,
    routePath: string,
    preCheck?: () => Promise<boolean>,
}

export enum WindowModEnum {
    Editor = 0,
    presenter = 1,
    reader = 2,
}

export const editorTab: TabOptionType = {
    title: 'Editor↗️',
    routePath: appProvider.editorHomePage,
    preCheck: async () => {
        const slide = await Slide.readFileToData(Slide.getSelectedFilePath());
        if (slide && !slide.isPdf) {
            return true;
        }
        showAppAlert(
            'No slide selected', 
            'Please select an Open Worship slide first',
        );
        return false;
    },
};
export const presenterTab: TabOptionType = {
    title: 'Presenter↗️',
    routePath: appProvider.presenterHomePage,
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
