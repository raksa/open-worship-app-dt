import { useState } from 'react';
import BibleList from '../bible-list/BibleList';
import LyricList from '../lyric-list/LyricList';
import TabRender from '../others/TabRender';
import BiblePreviewer from './BiblePreviewer';
import LyricPreviewer from './LyricPreviewer';

export const previewer: { show: Function } = {
    show: () => false,
};
export type TabType = 'b' | 'l' | null;
// b: bible, l: lyric
export default function FullTextPreviewer() {
    const [tabType, setTabType] = useState<TabType>(null);
    return (
        <div className='previewer overflow-hidden border-white-round h-100 d-flex flex-column p-1'>
            {tabType !== null ? <>
                <div className="previewer-header d-flex">
                    <TabRender<'b' | 'l'> tabs={[
                        ['b', 'Bible'],
                        ['l', 'Lyric'],
                    ]}
                        activeTab={tabType}
                        setActiveTab={setTabType} />
                </div>
                <div className='previewer-header p-2 flex-fill overflow-hidden'>
                    {tabType === 'b' && <BiblePreviewer />}
                    {tabType === 'l' && <LyricPreviewer />}
                </div>
            </> : <>
                <BibleList />
                <LyricList />
            </>}
        </div>
    );
}
