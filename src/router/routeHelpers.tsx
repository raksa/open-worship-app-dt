import { OptionalPromise } from '../others/otherHelpers';
import appProvider from '../server/appProvider';

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

export function toTitleExternal(title: string, style?: React.CSSProperties) {
    return (
        <span style={style}>
            {title + ' '}
            <i className="bi bi-box-arrow-up-right" />
        </span>
    );
}

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
