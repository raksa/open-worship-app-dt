import { createContext } from 'react';
import {
    useLocation, useNavigate,
    NavigateFunction, Location,
} from 'react-router-dom';

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

enum WindowModEnum {
    'editing' = 0,
    'presenting' = 1,
    'reading' = 2,
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

export const editingTab = genTabItem('Editing', '/edit');
export const presentingTab = genTabItem('Presenting', '/present');
export const readingTab = genTabItem('Read', '/reading');

export function goEditingMode(navigate: NavigateFunction) {
    navigate(editingTab.routePath);
}

export const WindowModeContext = createContext<WindowModEnum | null>(null);
export const DefaultTabContext = createContext<TabOptionType[] | null>(null);

export function genWindowMode(props?: TabCheckPropsType): WindowModEnum | null {
    if (props === undefined) {
        props = {
            location: window.location as any as Location,
            navigate: window.navigator as any as NavigateFunction,
        };
    }
    if (editingTab.checkIsActive?.(props)) {
        return WindowModEnum.editing;
    } else if (presentingTab.checkIsActive?.(props)) {
        return WindowModEnum.presenting;
    } else if (readingTab.checkIsActive?.(props)) {
        return WindowModEnum.reading;
    }
    return null;
}
export function useWindowMode(): WindowModEnum | null {
    const props = { location: useLocation(), navigate: useNavigate() };
    return genWindowMode(props);
}

function checkIsWindowMode(
    targetMode: WindowModEnum,
    mode?: WindowModEnum | null,
) {
    if (mode === null) {
        mode = genWindowMode();
    }
    return mode === targetMode;
}
export function checkIsWindowEditingMode(mode?: WindowModEnum | null) {
    return checkIsWindowMode(WindowModEnum.editing, mode);
}
export function useWindowIsEditingMode() {
    const windowType = useWindowMode();
    return checkIsWindowEditingMode(windowType);
}
export function checkIsWindowPresentingMode(mode?: WindowModEnum | null) {
    return checkIsWindowMode(WindowModEnum.presenting, mode);
}
export function useWindowIsPresentingMode() {
    const windowType = useWindowMode();
    return checkIsWindowPresentingMode(windowType);
}
export function checkIsWindowReadingMode(mode?: WindowModEnum | null) {
    return checkIsWindowMode(WindowModEnum.reading, mode);
}
export function useWindowIsReadingMode() {
    const windowType = useWindowMode();
    return checkIsWindowReadingMode(windowType);
}
