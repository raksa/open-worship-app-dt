import { useMemo, useState } from 'react';

import {
    TabOptionType, editorTab, goToPath, presenterTab, readerTab,
} from './routeHelpers';
import {
    BibleSearchButton, BibleSearchShowingContext, SettingButton,
} from '../others/commonButtons';
import { tran } from '../lang';
import appProvider from '../server/appProvider';
import { MultiContextRender } from '../helper/MultiContextRender';
import AppPopupWindows from '../app-modal/AppPopupWindows';
import AppContextMenu from '../others/AppContextMenu';
import HandleAlert from '../alert/HandleAlert';
import Toast from '../toast/Toast';
import Slide, { SelectedSlideContext } from '../slide-list/Slide';
import SlideItem, {
    SelectedEditingSlideItemContext,
} from '../slide-list/SlideItem';
import { useAppEffectAsync } from '../helper/debuggerHelpers';
import ProgressBar from '../progress-bar/ProgressBar';


const tabs: TabOptionType[] = [];
if (!appProvider.isPagePresenter) {
    tabs.push(presenterTab);
} else if (!appProvider.isPageEditor) {
    tabs.push(editorTab);
}
tabs.push(readerTab);

function TabRender() {
    return (
        <ul className='nav nav-tabs'>
            {tabs.map((tab) => {
                const { title, routePath } = tab;
                return (
                    <li key={tab.title}
                        className='nav-item'>
                        <button
                            className='btn btn-link nav-link'
                            onClick={() => {
                                goToPath(routePath);
                            }}>
                            {tran(title)}
                        </button>
                    </li>
                );
            })}
        </ul>
    );
}

function useSlideContextValues() {
    const [selectedSlide, setSelectedSlide] = useState<Slide | null>(null);
    const [selectedSlideItem, setSelectedSlideItem] = (
        useState<SlideItem | null>(null)
    );
    useAppEffectAsync(async (methodContext) => {
        const selectedSlideFilePath = Slide.getSelectedFilePath();
        if (selectedSlideFilePath === null) {
            return;
        }
        const slide = await Slide.readFileToData(selectedSlideFilePath);
        if (!slide) {
            return;
        }
        methodContext.setSelectedSlide(slide);
        const firstSlideItem = slide.items[0];
        methodContext.setSelectedSlideItem(firstSlideItem);
    }, undefined, { methods: { setSelectedSlide, setSelectedSlideItem } });
    const slideContextValue = useMemo(() => {
        return {
            selectedSlide: selectedSlide as Slide,
            setSelectedSlide: (newSelectedSlide: Slide) => {
                setSelectedSlide(newSelectedSlide);
                const firstSlideItem = newSelectedSlide.items[0];
                setSelectedSlideItem(firstSlideItem);
            },
        };
    }, [selectedSlide, setSelectedSlide]);
    const editingSlideItemContextValue = useMemo(() => {
        return {
            selectedSlideItem,
            setSelectedSlideItem: (newSelectedSlideItem: SlideItem) => {
                setSelectedSlideItem(newSelectedSlideItem);
            },
        };
    }, [selectedSlideItem, setSelectedSlideItem]);
    return {
        slideContextValue,
        editingSlideItemContextValue,
    };
}

export default function AppLayout({ children }: Readonly<{
    children: React.ReactNode,
}>) {
    const [isBibleSearchShowing, setIsBibleSearchShowing] = useState(false);
    const {
        slideContextValue, editingSlideItemContextValue,
    } = useSlideContextValues();
    return (
        <MultiContextRender contexts={[{
            context: BibleSearchShowingContext,
            value: {
                isShowing: isBibleSearchShowing,
                setIsShowing: setIsBibleSearchShowing,
            },
        }, {
            context: SelectedSlideContext,
            value: slideContextValue,
        }, {
            context: SelectedEditingSlideItemContext,
            value: editingSlideItemContextValue,
        }]}>
            {/* <TestInfinite /> */}
            < div id='app-header' className='d-flex' >
                <TabRender />
                <div className={
                    'highlight-border-bottom d-flex' +
                    ' justify-content-center flex-fill'
                }>
                    <BibleSearchButton />
                </div>
                <div className='highlight-border-bottom'>
                    <SettingButton />
                </div>
            </div >
            <div id='app-body' className='border-white-round'>
                {children}
            </div>
            <ProgressBar />
            <Toast />
            <AppContextMenu />
            <HandleAlert />
            <AppPopupWindows />
        </MultiContextRender >
    );
}
