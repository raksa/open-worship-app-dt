import { useMemo } from 'react';
import {
    Routes, Route, BrowserRouter, useLocation,
} from 'react-router-dom';

import NotFound404 from './router/NotFound404';
import AppPresenting from './AppPresenting';
import {
    DefaultTabContext, checkHome, editingTab, home, presentingTab, readingTab,
    savePathname,
} from './router/routeHelpers';
import AppLayout from './router/AppLayout';
import AppEditing from './AppEditing';
import AppReading from './AppReading';
import HandleAlert from './alert/HandleAlert';
import AppContextMenu from './others/AppContextMenu';
import Toast from './toast/Toast';
import AppPopupWindows, {
    APP_MODAL_QUERY_ROUTE_PATH,
} from './app-modal/AppPopupWindows';
import RedirectTo from './others/RedirectTo';
import { useHandleFind } from './_find/finderHelpers';
import { useCheckSelectedDir } from './helper/tourHelpers';

export default function App() {
    useCheckSelectedDir();
    useHandleFind();
    const tabProps = useMemo(() => {
        return [editingTab, presentingTab, readingTab];
    }, []);
    checkHome();
    return (
        <div id='app' className='dark' data-bs-theme='dark'>
            <DefaultTabContext.Provider value={tabProps}>
                <BrowserRouter>
                    <AppRouteRender />
                </BrowserRouter>
            </DefaultTabContext.Provider>
            <Toast />
            <AppContextMenu />
            <HandleAlert />
        </div>
    );
}

function AppRouteRender() {
    const location = useLocation();
    const state = location.state as {
        backgroundLocation?: Location,
    };
    const targetLocation = state?.backgroundLocation ?? location;
    savePathname(targetLocation);
    return (
        <>
            <Routes location={state?.backgroundLocation || location}>
                <Route element={<AppLayout />}>
                    <Route path={home.routePath}
                        element={<RedirectTo to={presentingTab.title} />}
                    />
                    <Route path={editingTab.routePath}
                        element={<AppEditing />}
                    />
                    <Route path={presentingTab.routePath}
                        element={<AppPresenting />}
                    />
                    <Route path={readingTab.routePath}
                        element={<AppReading />}
                    />
                </Route>
                <Route path='*' element={<NotFound404 />} />
            </Routes>
            {state?.backgroundLocation && (
                <Routes>
                    <Route path={APP_MODAL_QUERY_ROUTE_PATH}
                        element={<AppPopupWindows />}
                    />
                </Routes>
            )}
        </>
    );
}
