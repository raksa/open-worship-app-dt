import { ReactNode } from 'react';

import { Link } from 'react-router-dom';
import {
    APP_MODAL_ROUTE_PATH, toAppModalTypeData,
} from './helpers';
import {
    goHomeBack, useRouteLocationContext, useRouteNavigateContext,
} from '../router/routeHelpers';

export function useCloseAppModal() {
    const location = useRouteLocationContext();
    const navigate = useRouteNavigateContext();
    return () => {
        const backgroundLocation = location.state?.backgroundLocation;
        if (backgroundLocation) {
            navigate(backgroundLocation);
            return;
        }
        goHomeBack();
    };
}

export function useOpenAppModal(modalType: string, data?: string) {
    const appNav = useRouteNavigateContext();
    const location = useRouteLocationContext();
    return () => {
        const queryData = toAppModalTypeData(modalType, data ?? '');
        appNav(`${APP_MODAL_ROUTE_PATH}${queryData}`, {
            state: { backgroundLocation: location },
        });
    };
}

export default function LinkToAppModal({
    children, modalType, data,
}: Readonly<{
    children: ReactNode,
    modalType: string,
    data?: string,
}>) {
    const location = useRouteLocationContext();
    const modalTypeData = toAppModalTypeData(modalType, data || '');
    const routePath = `${APP_MODAL_ROUTE_PATH}${modalTypeData}`;
    return (
        <Link
            to={routePath}
            state={{ backgroundLocation: location }}>
            {children}
        </Link>
    );
}
