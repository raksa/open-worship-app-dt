import { OptionalPromise } from '../others/otherHelpers';
import { showAppAlert } from '../popup-widget/popupWidgetHelpers';
import appProvider from '../server/appProvider';
import { getSelectedVaryAppDocument } from '../app-document-list/appDocumentHelpers';
import AppDocument from '../app-document-list/AppDocument';

export type TabOptionType = {
    title: React.ReactNode;
    routePath: string;
    preCheck?: () => OptionalPromise<boolean>;
};

export enum WindowModEnum {
    Editor = 0,
    presenter = 1,
    reader = 2,
}

function toTitleExternal(title: string, style?: React.CSSProperties) {
    return (
        <span style={style}>
            {title + ' '}
            <i className="bi bi-box-arrow-up-right" />
        </span>
    );
}

export const editorTab: TabOptionType = {
    title: toTitleExternal('Editor'),
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
    title: toTitleExternal('Presenter', {
        color: 'var(--app-color-presenter)',
    }),
    routePath: appProvider.presenterHomePage,
};
export const readerTab: TabOptionType = {
    title: toTitleExternal('Reader', {
        color: 'var(--app-color-reader)',
    }),
    routePath: appProvider.readerHomePage,
};
export const experimentTab: TabOptionType = {
    title: toTitleExternal('(dev)Experiment'),
    routePath: appProvider.experimentHomePage,
};

export function goToPath(pathname: string) {
    const url = new URL(window.location.href);
    url.pathname = pathname;
    window.location.href = url.href;
}
