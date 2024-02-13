import {
    useLocation, useNavigate,
} from 'react-router-dom';
import { tran } from '../lang';
import {
    TabCheckPropsType, TabOptionType,
} from './routeHelpers';

export default function TabRender({
    tabs, className = '',
}: Readonly<{
    tabs: TabOptionType[],
    className?: string,
}>) {
    const navigate = useNavigate();
    const location = useLocation();
    const _renderItem = renderItem.bind(null, { navigate, location });
    return (
        <ul className={`nav nav-tabs ${className}`}>
            {tabs.map(_renderItem)}
        </ul>
    );
}

function renderItem(
    routeProps: TabCheckPropsType,
    {
        title, tabClassName,
        routePath, checkIsActive,
    }: TabOptionType,
) {
    const isActive = !!checkIsActive?.(routeProps);
    return (<li key={title}
        className={'nav-item ' + (tabClassName || '')}>
        <button
            className={`btn btn-link nav-link ${isActive ? 'active' : ''}`}
            onClick={() => {
                routeProps.navigate(routePath);
            }}>
            {tran(title)}
        </button>
    </li>);
}
