import { createContext } from 'react';

import {
    useLocation, useNavigate, NavigateFunction, Location,
} from 'react-router-dom';

import { getSetting, setSetting } from '../helper/settingHelper';
import appProvider from '../server/appProvider';

export type TabCheckPropsType = {
    navigate: NavigateFunction,
    location: Location,
}

export type TabOptionType = {
    title: string,
    tabClassName?: string,
    routePath: string,
    checkIsActive?: (_: TabCheckPropsType) => boolean,
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
        title, routePath,
        checkIsActive: checkIsActive.bind(null, routePath),
    };
}

export const home: TabOptionType = {
    title: 'Home',
    routePath: '/',
};
export const editorTab = genTabItem('Editor', '/editor');
export const presenterTab = genTabItem('Presenter', '/presenter');
export const readerTab = genTabItem('Reader', '/reader');

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
    } else if (readerTab.checkIsActive?.(props)) {
        return WindowModEnum.reader;
    }
    return null;
}
export function useWindowMode(): WindowModEnum | null {
    let location = useLocation();
    location = location.state?.backgroundLocation || location;
    const props = {
        location,
        navigate: useNavigate(),
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
    if (url.pathname === '/') {
        if (appProvider.isDesktop) {
            const savePathname = getSetting(ROUTE_PATHNAME_KEY);
            if (!['/', ''].includes(savePathname)) {
                return goToPath(savePathname);
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
