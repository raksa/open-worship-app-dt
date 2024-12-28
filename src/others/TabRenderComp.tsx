import { LazyExoticComponent } from 'react';

import { tran } from '../lang';
import AppSuspenseComp from './AppSuspenseComp';

export type TabHeaderPropsType<T> = [T, string, string?];
export default function TabRenderComp<T extends string>({
    tabs, activeTab, setActiveTab, className,
}: Readonly<{
    tabs: TabHeaderPropsType<T>[],
    activeTab: T,
    setActiveTab?: (t: T) => void,
    className?: string,
}>) {
    return (
        <ul className={`nav nav-tabs ${className}`}>
            {tabs.map(([tab, title, tabClassName]) => {
                const activeClass = activeTab === tab ? 'active' : '';
                return (<li key={title}
                    className={'nav-item ' + (tabClassName ?? '')}>
                    <button className={`btn btn-link nav-link ${activeClass}`}
                        onClick={() => {
                            setActiveTab?.(tab);
                        }}>
                        {tran(title)}
                    </button>
                </li>);
            })}
        </ul>
    );
}

export function genTabBody<T>(
    selectedTabTab: T,
    [tabTab, Element]: [T, LazyExoticComponent<() => React.ReactNode | null>],
) {
    return (
        <AppSuspenseComp key={`tab-${tabTab}`}>
            {selectedTabTab === tabTab ? (
                <Element />
            ) : null}
        </AppSuspenseComp>
    );
}
