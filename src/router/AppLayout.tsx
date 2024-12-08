import { useContext } from 'react';

import { Outlet } from 'react-router-dom';
import SettingHeader from '../setting/SettingHeader';
import BibleSearchHeader from '../bible-search/BibleSearchHeader';
import TabHeadRender from './TabHeadRender';
import {
    DefaultTabContext,
    TabOptionType, WindowModeContext, useWindowMode,
} from './routeHelpers';

export default function AppLayout() {
    const tabOptionList = useContext(DefaultTabContext);
    const windowMode = useWindowMode();
    if (tabOptionList === null) {
        return <Outlet />;
    }
    return (
        <WindowModeContext.Provider value={windowMode}>
            <>
                {/* <TestInfinite /> */}
                {getHeader(tabOptionList)}
                {genBody()}
            </>
        </WindowModeContext.Provider>
    );
}

function getHeader(tabOptionList: TabOptionType[]) {
    return (
        <div id='app-header' className='d-flex'>
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
        <div id='app-body' className='border-white-round'>
            <Outlet />
        </div>
    );
}
