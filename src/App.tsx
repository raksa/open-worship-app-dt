import { useMemo } from 'react';
import {
    Routes, Route, BrowserRouter, useLocation,
} from 'react-router-dom';

import NotFound404 from './router/NotFound404';
import AppPresenter from './AppPresenter';
import {
    DefaultTabContext, checkHome, editorTab, home, presenterTab, readerTab,
    savePathname,
} from './router/routeHelpers';
import AppLayout from './router/AppLayout';
import AppEditor from './AppEditor';
import AppReader from './AppReader';
import HandleAlert from './alert/HandleAlert';
import AppContextMenu from './others/AppContextMenu';
import Toast from './toast/Toast';
import AppPopupWindows, {
    APP_MODAL_QUERY_ROUTE_PATH,
} from './app-modal/AppPopupWindows';
import RedirectTo from './others/RedirectTo';
import { useHandleFind } from './_find/finderHelpers';
import { useCheckSelectedDir } from './helper/tourHelpers';
import ProgressBar from './progress-bar/ProgressBar';

export default function App() {
    useCheckSelectedDir();
    useHandleFind();
    const tabProps = useMemo(() => {
        return [editorTab, presenterTab, readerTab];
    }, []);
    checkHome();
    return (
        <div id='app' className='dark' data-bs-theme='dark'>
            <DefaultTabContext.Provider value={tabProps}>
                <BrowserRouter>
                    <AppRouteRender />
                </BrowserRouter>
            </DefaultTabContext.Provider>
            <ProgressBar />
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
                        element={<RedirectTo to={presenterTab.title} />}
                    />
                    <Route path={editorTab.routePath}
                        element={<AppEditor />}
                    />
                    <Route path={presenterTab.routePath}
                        element={<AppPresenter />}
                    />
                    <Route path={readerTab.routePath}
                        element={<AppReader />}
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
