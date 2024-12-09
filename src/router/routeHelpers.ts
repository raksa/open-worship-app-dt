import { createContext, useContext } from 'react';

import {
    NavigateFunction, Location,
} from 'react-router-dom';

import { getSetting, setSetting } from '../helper/settingHelpers';
import appProvider from '../server/appProvider';

export type TabCheckPropsType = {
    navigate: NavigateFunction,
    location: Location,
}

export type TabOptionType = {
    title: string,
    tabClassName?: string,
    routePath: string,
    extraChildren?: React.ReactNode,
    checkIsActive?: (_: TabCheckPropsType) => boolean,
    customNavigate?: () => void,
}

export enum WindowModEnum {
    Editor = 0,
    presenter = 1,
    reader = 2,
}

function checkIsActive(routePath: string, routeProps: TabCheckPropsType) {
    const { location } = routeProps;
    const pathArray = location.pathname.split('/').filter((item) => {
        return item !== '';
    });
    routePath = routePath.split('/').filter((item) => {
        return item !== '';
    }).join('/');
    const isActive = pathArray.indexOf(routePath) === 0;
    return isActive;
}
function genTabItem(title: string, routePath: string): TabOptionType {
    return {
        title,
        routePath: `${appProvider.presenterHomePage}`,
        checkIsActive: checkIsActive.bind(null, routePath),
    };
}

export const home: TabOptionType = {
    title: 'Home',
    routePath: appProvider.presenterHomePage,
};
export const editorTab = genTabItem('Editor', 'editor');
export const presenterTab = genTabItem('Presenter', 'presenter');
export const readerTab: TabOptionType = {
    title: 'Reader↗️',
    routePath: appProvider.readerHomePage,
    customNavigate: () => {
        goToPath(appProvider.readerHomePage);
    },
};

export function goEditorMode(navigate: NavigateFunction) {
    navigate(editorTab.routePath);
}

export const WindowModeContext = createContext<WindowModEnum | null>(null);
export const DefaultTabContext = createContext<TabOptionType[] | null>(null);

function getWindowMode(props?: TabCheckPropsType): WindowModEnum | null {
    if (props === undefined) {
        props = {
            location: window.location as any as Location,
            navigate: window.navigator as any as NavigateFunction,
        };
    }
    if (editorTab.checkIsActive?.(props)) {
        return WindowModEnum.Editor;
    } else if (presenterTab.checkIsActive?.(props)) {
        return WindowModEnum.presenter;
    }
    return null;
}
export function useWindowMode(): WindowModEnum | null {
    let location = useRouteLocationContext();
    location = location.state?.backgroundLocation || location;
    const navigate = useRouteNavigateContext();
    const props = {
        location, navigate,
    };
    return getWindowMode(props);
}

function checkIsWindowMode(
    targetMode: WindowModEnum,
    mode?: WindowModEnum | null,
) {
    mode = mode || getWindowMode();
    return mode === targetMode;
}
export function checkIsWindowEditorMode(mode?: WindowModEnum | null) {
    return checkIsWindowMode(WindowModEnum.Editor, mode);
}
export function useWindowIsEditorMode() {
    const windowMode = useWindowMode();
    return checkIsWindowEditorMode(windowMode);
}
export function checkIsWindowPresenterMode(mode?: WindowModEnum | null) {
    return checkIsWindowMode(WindowModEnum.presenter, mode);
}
export function useWindowIsPresenterMode() {
    const windowMode = useWindowMode();
    return checkIsWindowPresenterMode(windowMode);
}
export function checkIsWindowReaderMode(mode?: WindowModEnum | null) {
    return checkIsWindowMode(WindowModEnum.reader, mode);
}
export function useWindowIsReaderMode() {
    const windowMode = useWindowMode();
    return checkIsWindowReaderMode(windowMode);
}

export function goToPath(pathname: string) {
    const url = new URL(window.location.href);
    url.pathname = pathname;
    window.location.href = url.href;
}
export function goHomeBack() {
    goToPath(presenterTab.routePath);
}

const ROUTE_PATHNAME_KEY = 'route-pathname';

export function checkHome() {
    const url = new URL(window.location.href);
    if (url.pathname === home.routePath) {
        if (appProvider.isDesktop) {
            const savedPathname = getSetting(ROUTE_PATHNAME_KEY);
            if (savedPathname === url.pathname) {
                return;
            }
            if (![home.routePath, '/', ''].includes(savedPathname)) {
                return goToPath(savedPathname);
            }
        }
        goHomeBack();
    }
}

export function savePathname(location: { pathname: string }) {
    if (appProvider.isDesktop) {
        setSetting(ROUTE_PATHNAME_KEY, location.pathname);
    }
}

export const RouteNavigateContext = (
    createContext<NavigateFunction | null>(null)
);
export function useRouteNavigateContext() {
    const location = useContext(RouteNavigateContext);
    if (location === null) {
        throw new Error(
            'useRouteNavigate must be used within a RouteNavigateContext',
        );
    }
    return location;
}

export const RouteLocationContext = (
    createContext<Location | null>(null)
);
export function useRouteLocationContext() {
    const location = useContext(RouteLocationContext);
    if (location === null) {
        throw new Error(
            'useRouteLocation must be used within a RouteLocationProvider',
        );
    }
    return location;
}
