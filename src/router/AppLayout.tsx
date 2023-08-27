import 'bootstrap-icons/font/bootstrap-icons.css';
import './AppLayout.scss';
import '../others/bootstrap-override.scss';
import '../others/scrollbar.scss';

import SettingHeader from '../setting/SettingHeader';
import BibleSearchHeader from '../bible-search/BibleSearchHeader';
import TabHeadRender from './TabHeadRender';
import { Outlet } from 'react-router-dom';
import {
    DefaultTabContext,
    TabOptionType, WindowModeContext, useWindowMode,
} from './routeHelpers';
import { useContext } from 'react';

export default function AppLayout() {
    const tabOptionList = useContext(DefaultTabContext);
    const windowMode = useWindowMode();
    if (tabOptionList === null) {
        return <Outlet />;
    }
    return (
        <WindowModeContext.Provider value={windowMode}>
            <div className='d-flex flex-column w-100 h-100'>
                {/* <TestInfinite /> */}
                {getHeader(tabOptionList)}
                {genBody()}
            </div>
        </WindowModeContext.Provider>
    );
}

function getHeader(tabOptionList: TabOptionType[]) {
    return (
        <div className='app-header d-flex'>
            <TabHeadRender tabs={tabOptionList || []} />
            <div className={
                'highlight-border-bottom d-flex'
                + ' justify-content-center flex-fill'
            }>
                <BibleSearchHeader />
            </div>
            <div className='highlight-border-bottom'>
                <SettingHeader />
            </div>
        </div>
    );
}

function genBody() {
    return (
        <div className='app-body flex-fill flex h border-white-round'>
            <Outlet />
        </div>
    );
}