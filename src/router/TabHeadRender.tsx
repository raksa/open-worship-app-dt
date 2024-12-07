import { tran } from '../lang';
import {
    TabCheckPropsType, TabOptionType,
    useRouteLocationContext,
    useRouteNavigateContext,
} from './routeHelpers';

export default function TabRender({
    tabs, className = '',
}: Readonly<{
    tabs: TabOptionType[],
    className?: string,
}>) {
    const navigate = useRouteNavigateContext();
    const location = useRouteLocationContext();
    const renderItem1 = renderItem.bind(null, { navigate, location });
    return (
        <ul className={`nav nav-tabs ${className}`}>
            {tabs.map(renderItem1)}
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
