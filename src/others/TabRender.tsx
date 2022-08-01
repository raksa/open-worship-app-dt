import React from 'react';
import { useTranslation } from 'react-i18next';

export default function TabRender<T extends string>({
    tabs, activeTab, setActiveTab, className,
}: {
    tabs: [T, string][],
    activeTab: T,
    setActiveTab?: (t: T) => void,
    className?: string,
}) {
    const { t } = useTranslation();
    return (
        <ul className={`nav nav-tabs ${className}`}>
            {tabs.map(([tab, title], i) => {
                const activeClass = activeTab === tab ? 'active' : '';
                return (<li key={i} className='nav-item'>
                    <button className={`btn btn-link nav-link ${activeClass}`}
                        onClick={() => {
                            if (tab !== activeTab) {
                                setActiveTab && setActiveTab(tab);
                            }
                        }}>
                        {t(title)}
                    </button>
                </li>);
            })}
        </ul>
    );
}

export function genTabBody<T>(tabTab: T,
    data: [T, React.LazyExoticComponent<() => JSX.Element>]) {
    const Element = data[1];
    return (
        <React.Suspense fallback={<div>Loading...</div>}>
            {tabTab === data[0] && <Element />}
        </React.Suspense>
    );
}
