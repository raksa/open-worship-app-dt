import {
    Routes, Route, BrowserRouter,
} from 'react-router-dom';
import NotFound404 from './router/NotFound404';
import AppPresenting from './AppPresenting';
import {
    DefaultTabContext, editingTab,
    presentingTab, readingTab,
} from './router/routeHelpers';
import AppLayout from './router/AppLayout';
import AppEditing from './AppEditing';
import AppReading from './AppReading';
import HandleAlert from './alert/HandleAlert';
import AppContextMenu from './others/AppContextMenu';
import Toast from './toast/Toast';

function checkHome() {
    const url = new URL(window.location.href);
    if (url.pathname === '/') {
        url.pathname = presentingTab.routePath;
        window.location.href = url.href;
    }
}

export default function App() {
    const tabProps = [
        editingTab,
        presentingTab,
        readingTab,
    ];
    checkHome();
    return (
        <>
            <DefaultTabContext.Provider value={tabProps}>
                <BrowserRouter>
                    <Routes>
                        <Route element={<AppLayout />}>
                            <Route path={editingTab.routePath}
                                element={<AppEditing />} />
                            <Route path={presentingTab.routePath}
                                element={<AppPresenting />} />
                            <Route path={readingTab.routePath}
                                element={<AppReading />} />
                        </Route>
                        <Route path="*" element={<NotFound404 />} />
                    </Routes>
                </BrowserRouter>
            </DefaultTabContext.Provider>
            <Toast />
            <AppContextMenu />
            <HandleAlert />
        </>
    );
}
