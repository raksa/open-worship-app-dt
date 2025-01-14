import { OptionalPromise } from '../others/otherHelpers';
import { showAppAlert } from '../popup-widget/popupWidgetHelpers';
import appProvider from '../server/appProvider';
import { getSelectedVaryAppDocument } from '../app-document-list/appDocumentHelpers';
import AppDocument from '../app-document-list/AppDocument';

export type TabOptionType = {
    title: string;
    routePath: string;
    preCheck?: () => OptionalPromise<boolean>;
};

export enum WindowModEnum {
    Editor = 0,
    presenter = 1,
    reader = 2,
}

export const editorTab: TabOptionType = {
    title: 'Editor↗️',
    routePath: appProvider.editorHomePage,
    preCheck: async () => {
        const varyAppDocument = await getSelectedVaryAppDocument();
        if (!AppDocument.checkIsThisType(varyAppDocument)) {
            showAppAlert(
                'No slide selected',
                'Please select an Open Worship slide first',
            );
            return false;
        }
        return true;
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
