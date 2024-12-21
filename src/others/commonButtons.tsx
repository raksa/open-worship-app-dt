import { createContext, use } from 'react';

import {
    EventMapper, toShortcutKey,
} from '../event/KeyboardEventListener';
import { tran } from '../lang';
import { goToPath } from '../router/routeHelpers';
import appProvider from '../server/appProvider';

export function QuickOrBackButton({
    title, defaultPage = appProvider.presenterHomePage,
}: Readonly<{
    title: string,
    defaultPage?: string,
}>) {
    return (
        <button className='btn btn-sm btn-outline-warning'
            title={title}
            onClick={() => {
                if (
                    document.referrer &&
                    !document.referrer.includes(appProvider.currentHomePage)
                ) {
                    window.history.back();
                } else {
                    goToPath(defaultPage);
                }
            }}>
            <i className='bi bi-escape' />
        </button>
    );
}

export function SettingButton() {
    return (
        <button className='btn btn-outline-success rotating-hover'
            title='Setting'
            onClick={() => {
                goToPath(appProvider.settingHomePage);
            }}>
            <i className='bi bi-gear-wide-connected' />
        </button>
    );
}

export const BibleSearchShowingContext = createContext<{
    isShowing: boolean,
    setIsShowing: (isShowing: boolean) => void,
} | null>(null);
const openBibleEventMap: EventMapper = {
    allControlKey: ['Ctrl'],
    key: 'b',
};

export function useBibleSearchShowingContext() {
    const context = use(BibleSearchShowingContext);
    if (context === null) {
        throw new Error(
            'useBibleSearchShowingContext must be used within a ' +
            'BibleSearchShowingProvider'
        );
    }
    return context;
}

export function useShowBibleSearchContext(isShowing = true) {
    const context = use(BibleSearchShowingContext);
    if (context === null) {
        return null;
    }
    return context.setIsShowing.bind(null, isShowing);
}

export function BibleSearchButton() {
    const {
        setIsShowing: setIsBibleSearchShowing,
    } = useBibleSearchShowingContext();
    return (
        <button className='btn btn-labeled btn-primary'
            style={{ width: '220px' }}
            title={`Bible search [${toShortcutKey(openBibleEventMap)}]`}
            type='button'
            onClick={() => {
                setIsBibleSearchShowing(true);
            }}>
            <span className='btn-label'>
                <i className='bi bi-book' />
            </span>
            {tran('bible-search')}
        </button>
    );
}
