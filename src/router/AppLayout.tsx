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
import AppDocument from '../slide-list/AppDocument';
import Slide from '../slide-list/Slide';
import { useAppEffectAsync } from '../helper/debuggerHelpers';
import TopProgressBarComp from '../progress-bar/TopProgressBarComp';
import { useFileSourceEvents } from '../helper/dirSourceHelpers';
import {
    SelectedEditingSlideItemContext,
    SelectedVaryAppDocumentContext,
    getSelectedVaryAppDocument,
    VaryAppDocumentType,
    VaryAppDocumentItemType,
    getSelectedVaryAppDocumentItem,
} from '../slide-list/appDocumentHelpers';

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

function useAppDocumentContextValues() {
    const [selectedVaryAppDocument, setSelectedVaryAppDocument] =
        useState<VaryAppDocumentType | null>(null);
    const [selectedVaryAppDocumentItem, setSelectedVaryAppDocumentItem] =
        useState<VaryAppDocumentItemType | null>(null);
    useAppEffectAsync(
        async (methodContext) => {
            const varyAppDocument = await getSelectedVaryAppDocument();
            methodContext.setSelectedVaryAppDocument(varyAppDocument);
            const varyAppDocumentItem = await getSelectedVaryAppDocumentItem();
            methodContext.setSelectedVaryAppDocumentItem(varyAppDocumentItem);
        },
        undefined,
        {
            setSelectedVaryAppDocument,
            setSelectedVaryAppDocumentItem,
        },
    );
    const varyAppDocumentContextValue = useMemo(() => {
        return {
            selectedVaryAppDocument,
            setSelectedVaryAppDocument: async (
                newSelectedSlide: AppDocument | null,
            ) => {
                setSelectedVaryAppDocument(newSelectedSlide);
                if (newSelectedSlide === null) {
                    setSelectedVaryAppDocumentItem(null);
                } else {
                    const slideItems = await newSelectedSlide.getItems();
                    const firstSlideItem = slideItems[0];
                    setSelectedVaryAppDocumentItem(firstSlideItem);
                }
            },
        };
    }, [selectedVaryAppDocument, setSelectedVaryAppDocument]);
    const editingAppDocumentItemContextValue = useMemo(() => {
        return {
            selectedVaryAppDocumentItem,
            setSelectedVaryAppDocumentItem: (newSelectedSlideItem: Slide) => {
                setSelectedVaryAppDocumentItem(newSelectedSlideItem);
            },
        };
    }, [selectedVaryAppDocumentItem, setSelectedVaryAppDocumentItem]);
    useFileSourceEvents(
        ['delete'],
        (deletedSlideItem: Slide) => {
            setSelectedVaryAppDocumentItem((slideItem) => {
                if (slideItem?.checkIsSame(deletedSlideItem)) {
                    return null;
                }
                return slideItem;
            });
        },
        [selectedVaryAppDocument],
        selectedVaryAppDocument?.filePath,
    );
    useFileSourceEvents(
        ['update'],
        async () => {
            const varyAppDocumentItems = selectedVaryAppDocument
                ? await selectedVaryAppDocument.getItems()
                : [];
            setSelectedVaryAppDocumentItem((oldVaryAppDocumentItem) => {
                const newVaryAppDocumentItem = oldVaryAppDocumentItem
                    ? varyAppDocumentItems.find((item) => {
                          return item.checkIsSame(oldVaryAppDocumentItem);
                      })
                    : null;
                return newVaryAppDocumentItem || oldVaryAppDocumentItem;
            });
        },
        [selectedVaryAppDocument],
        selectedVaryAppDocument?.filePath,
    );
    return {
        varyAppDocumentContextValue,
        editingAppDocumentItemContextValue,
    };
}

export default function AppLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [isBibleSearchShowing, setIsBibleSearchShowing] = useState(false);
    const { varyAppDocumentContextValue, editingAppDocumentItemContextValue } =
        useAppDocumentContextValues();
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
                    context: SelectedVaryAppDocumentContext,
                    value: varyAppDocumentContextValue,
                },
                {
                    context: SelectedEditingSlideItemContext,
                    value: editingAppDocumentItemContextValue,
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
