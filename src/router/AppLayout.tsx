import { useMemo, useState } from 'react';

import {
    TabOptionType,
    editorTab,
    goToPath,
    presenterTab,
    readerTab,
} from './routeHelpers';
import {
    BibleSearchButtonComp,
    BibleSearchShowingContext,
    SettingButtonComp,
} from '../others/commonButtons';
import { tran } from '../lang';
import appProvider from '../server/appProvider';
import { MultiContextRender } from '../helper/MultiContextRender';
import AppPopupWindows from '../app-modal/AppPopupWindows';
import AppContextMenuComp from '../others/AppContextMenuComp';
import HandleAlertComp from '../popup-widget/HandleAlertComp';
import Toast from '../toast/Toast';
import Slide, { SelectedSlideContext } from '../slide-list/Slide';
import SlideItem, {
    SelectedEditingSlideItemContext,
} from '../slide-list/SlideItem';
import { useAppEffectAsync } from '../helper/debuggerHelpers';
import TopProgressBarComp from '../progress-bar/TopProgressBarComp';
import { useFileSourceEvents } from '../helper/dirSourceHelpers';

const tabs: TabOptionType[] = [];
if (!appProvider.isPagePresenter) {
    tabs.push(presenterTab);
} else if (!appProvider.isPageEditor) {
    tabs.push(editorTab);
}
tabs.push(readerTab);

function TabRender() {
    const handleClicking = async (tab: TabOptionType) => {
        if (tab.preCheck) {
            const isPassed = await tab.preCheck();
            if (!isPassed) {
                return;
            }
        }
        goToPath(tab.routePath);
    };
    return (
        <ul className="nav nav-tabs">
            {tabs.map((tab) => {
                return (
                    <li key={tab.title} className="nav-item">
                        <button
                            className="btn btn-link nav-link"
                            onClick={handleClicking.bind(null, tab)}
                        >
                            {tran(tab.title)}
                        </button>
                    </li>
                );
            })}
        </ul>
    );
}

function useSlideContextValues() {
    const [selectedSlide, setSelectedSlide] = useState<Slide | null>(null);
    const [selectedSlideItem, setSelectedSlideItem] =
        useState<SlideItem | null>(null);
    useAppEffectAsync(
        async (methodContext) => {
            const slide = await Slide.getSelectedSlide();
            methodContext.setSelectedSlide(slide);
            const slideItem = await Slide.getSelectedSlideItem();
            methodContext.setSelectedSlideItem(slideItem);
        },
        undefined,
        { setSelectedSlide, setSelectedSlideItem },
    );
    const slideContextValue = useMemo(() => {
        return {
            selectedSlide: selectedSlide,
            setSelectedSlide: (newSelectedSlide: Slide | null) => {
                setSelectedSlide(newSelectedSlide);
                if (newSelectedSlide === null) {
                    setSelectedSlideItem(null);
                } else {
                    const firstSlideItem = newSelectedSlide.items[0];
                    setSelectedSlideItem(firstSlideItem);
                }
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
    useFileSourceEvents(
        ['delete'],
        (deletedSlideItem: SlideItem) => {
            setSelectedSlideItem((slideItem) => {
                if (slideItem?.checkIsSame(deletedSlideItem)) {
                    return null;
                }
                return slideItem;
            });
        },
        [selectedSlide],
        selectedSlide?.filePath,
    );
    useFileSourceEvents(
        ['update'],
        () => {
            setSelectedSlideItem((oldSlideItem) => {
                const newSlideItem = oldSlideItem
                    ? selectedSlide?.items.find((item) => {
                          return item.checkIsSame(oldSlideItem);
                      })
                    : null;
                return newSlideItem || oldSlideItem;
            });
        },
        [selectedSlide],
        selectedSlide?.filePath,
    );
    return {
        slideContextValue,
        editingSlideItemContextValue,
    };
}

export default function AppLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [isBibleSearchShowing, setIsBibleSearchShowing] = useState(false);
    const { slideContextValue, editingSlideItemContextValue } =
        useSlideContextValues();
    return (
        <MultiContextRender
            contexts={[
                {
                    context: BibleSearchShowingContext,
                    value: {
                        isShowing: isBibleSearchShowing,
                        setIsShowing: setIsBibleSearchShowing,
                    },
                },
                {
                    context: SelectedSlideContext,
                    value: slideContextValue,
                },
                {
                    context: SelectedEditingSlideItemContext,
                    value: editingSlideItemContextValue,
                },
            ]}
        >
            {/* <TestInfinite /> */}
            <div id="app-header" className="d-flex">
                <TabRender />
                <div
                    className={
                        'highlight-border-bottom d-flex' +
                        ' justify-content-center flex-fill'
                    }
                >
                    <BibleSearchButtonComp />
                </div>
                <div className="highlight-border-bottom">
                    <SettingButtonComp />
                </div>
            </div>
            <div id="app-body" className="app-border-white-round">
                {children}
            </div>
            <TopProgressBarComp />
            <Toast />
            <AppContextMenuComp />
            <HandleAlertComp />
            <AppPopupWindows />
        </MultiContextRender>
    );
}
