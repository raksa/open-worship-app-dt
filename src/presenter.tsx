import { useMemo } from 'react';

import {
    useNavigate, useLocation, Routes, Route, BrowserRouter,
} from 'react-router-dom';
import HandleAlert from './alert/HandleAlert';
import AppEditor from './AppEditor';
import { main } from './appInitHelpers';
import AppPresenter from './AppPresenter';
import { MultiContextRender } from './helper/MultiContextRender';
import AppContextMenu from './others/AppContextMenu';
import RedirectTo from './others/RedirectTo';
import ProgressBar from './progress-bar/ProgressBar';
import AppLayout from './router/AppLayout';
import NotFound404 from './router/NotFound404';
import {
    savePathname, RouteNavigateContext, RouteLocationContext, home,
    presenterTab, editorTab, readerTab, checkHome, DefaultTabContext,
} from './router/routeHelpers';
import Toast from './toast/Toast';

function AppRouteRender() {
    const navigation = useNavigate();
    const location = useLocation();
    const state = location.state as {
        backgroundLocation?: Location,
    };
    const targetLocation = state?.backgroundLocation ?? location;
    savePathname(targetLocation);
    return (
        <MultiContextRender contexts={[{
            context: RouteNavigateContext,
            value: navigation,
        }, {
            context: RouteLocationContext,
            value: targetLocation,
        }]}>
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
                </Route>
                <Route path='*' element={<NotFound404 />} />
            </Routes>
        </MultiContextRender>
    );
}

function Presenter() {
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

main(<Presenter />);
