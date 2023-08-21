import { Link, useLocation, useNavigate } from 'react-router-dom';
import { goHomeBack } from '../router/NotFound404';
import { APP_MODAL_ROUTE_PATH, toAppModalTypeData } from './helpers';

export function useCloseAppModal() {
    const location = useLocation();
    const appNav = useNavigate();
    return () => {
        const backgroundLocation = location.state?.backgroundLocation;
        if (backgroundLocation) {
            appNav(backgroundLocation);
            return;
        }
        goHomeBack();
    };
}

export function useOpenAppModal(modalType: string) {
    const appNav = useNavigate();
    const location = useLocation();
    return (data: string = '') => {
        const queryData = toAppModalTypeData(modalType, data);
        appNav(`${APP_MODAL_ROUTE_PATH}${queryData}`, {
            state: { backgroundLocation: location },
        });
    };
}

export default function LinkToAppModal({
    children, modalType, data,
}: {
    children: React.ReactNode,
    modalType: string,
    data?: string,
}) {
    const location = useLocation();
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
