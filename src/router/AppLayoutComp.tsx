import { useMemo, useState } from 'react';

import {
    TabOptionType,
    editorTab,
    experimentTab,
    goToPath,
    presenterTab,
    readerTab,
} from './routeHelpers';
import {
    BibleLookupButtonComp,
    BibleLookupShowingContext,
    SettingButtonComp,
} from '../others/commonButtons';
import appProvider from '../server/appProvider';
import { MultiContextRender } from '../helper/MultiContextRender';
import AppPopupWindowsComp from '../app-modal/AppPopupWindowsComp';
import AppContextMenuComp from '../context-menu/AppContextMenuComp';
import HandleAlertComp from '../popup-widget/HandleAlertComp';
import ToastComp from '../toast/ToastComp';
import AppDocument from '../app-document-list/AppDocument';
import Slide from '../app-document-list/Slide';
import { useAppEffectAsync } from '../helper/debuggerHelpers';
import TopProgressBarComp from '../progress-bar/TopProgressBarComp';
import { useFileSourceEvents } from '../helper/dirSourceHelpers';
import {
    SelectedEditingSlideContext,
    SelectedVaryAppDocumentContext,
    getSelectedVaryAppDocument,
    VaryAppDocumentType,
    getSelectedEditingSlide,
    setSelectedVaryAppDocument,
    setSelectedEditingSlide,
} from '../app-document-list/appDocumentHelpers';

const tabs: TabOptionType[] = [];
if (!appProvider.isPagePresenter) {
    tabs.push(presenterTab);
} else if (!appProvider.isPageEditor) {
    tabs.push(editorTab);
}
tabs.push(readerTab);
if (appProvider.systemUtils.isDev) {
    tabs.push(experimentTab);
}

function TabRenderComp() {
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
            {tabs.map((tab, i) => {
                return (
                    <li key={i} className="nav-item">
                        <button
                            className="btn btn-link nav-link"
                            onClick={handleClicking.bind(null, tab)}
                        >
                            {tab.title}
                        </button>
                    </li>
                );
            })}
        </ul>
    );
}

function useAppDocumentContextValues() {
    const [varyAppDocument, setVaryAppDocument] =
        useState<VaryAppDocumentType | null>(null);
    const setVaryAppDocument1 = (
        newVaryAppDocument: VaryAppDocumentType | null,
    ) => {
        setVaryAppDocument(newVaryAppDocument);
        setSelectedVaryAppDocument(newVaryAppDocument);
    };

    const [slide, setSlide] = useState<Slide | null>(null);
    const setSlide1 = (newSlide: Slide | null) => {
        setSlide(newSlide);
        setSelectedEditingSlide(newSlide);
    };

    useAppEffectAsync(
        async (methodContext) => {
            const varyAppDocument = await getSelectedVaryAppDocument();
            methodContext.setVaryAppDocument(varyAppDocument);
            const varyAppDocumentItem = await getSelectedEditingSlide();
            methodContext.setSlide(varyAppDocumentItem);
        },
        [],
        {
            setVaryAppDocument,
            setSlide,
        },
    );
    const varyAppDocumentContextValue = useMemo(() => {
        return {
            selectedVaryAppDocument: varyAppDocument,
            setSelectedVaryAppDocument: async (
                newVaryAppDocument: VaryAppDocumentType | null,
            ) => {
                setVaryAppDocument1(newVaryAppDocument);
                let selectedSlide: Slide | null = null;
                if (
                    newVaryAppDocument !== null &&
                    AppDocument.checkIsThisType(newVaryAppDocument)
                ) {
                    const varyAppDocumentItems =
                        await newVaryAppDocument.getItems();
                    selectedSlide = varyAppDocumentItems[0] ?? null;
                }
                setSlide1(selectedSlide);
            },
        };
    }, [varyAppDocument]);
    const editingSlideContextValue = useMemo(() => {
        return {
            selectedSlide: slide,
            setSelectedSlide: (newSelectedSlide: Slide) => {
                setSlide1(newSelectedSlide);
            },
        };
    }, [slide]);
    useFileSourceEvents(
        ['update'],
        async () => {
            if (
                varyAppDocument === null ||
                !AppDocument.checkIsThisType(varyAppDocument)
            ) {
                return;
            }
            const slides = await varyAppDocument.getItems();
            const newSlide =
                slides.find((item) => {
                    return slide !== null && item.checkIsSame(slide);
                }) ??
                slides[0] ??
                null;
            setSlide1(newSlide);
        },
        [varyAppDocument, slide],
        varyAppDocument?.filePath,
    );
    useFileSourceEvents(
        ['delete'],
        (filePath: string) => {
            if (varyAppDocument?.filePath === filePath) {
                setVaryAppDocument1(null);
                setSlide1(null);
            }
        },
        [varyAppDocument],
    );
    return {
        varyAppDocumentContextValue,
        editingSlideContextValue,
    };
}

export default function AppLayoutComp({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [isBibleLookupShowing, setIsBibleLookupShowing] = useState(false);
    const { varyAppDocumentContextValue, editingSlideContextValue } =
        useAppDocumentContextValues();
    return (
        <MultiContextRender
            contexts={[
                {
                    context: BibleLookupShowingContext,
                    value: {
                        isShowing: isBibleLookupShowing,
                        setIsShowing: setIsBibleLookupShowing,
                    },
                },
                {
                    context: SelectedVaryAppDocumentContext,
                    value: varyAppDocumentContextValue,
                },
                {
                    context: SelectedEditingSlideContext,
                    value: editingSlideContextValue,
                },
            ]}
        >
            {/* <TestInfinite /> */}
            <div id="app-header" className="d-flex">
                <TabRenderComp />
                <div
                    className={
                        'app-highlight-border-bottom d-flex' +
                        ' justify-content-center flex-fill'
                    }
                >
                    <BibleLookupButtonComp />
                </div>
                <div className="app-highlight-border-bottom">
                    <SettingButtonComp />
                </div>
            </div>
            <div id="app-body" className="app-border-white-round">
                {children}
            </div>
            <TopProgressBarComp />
            <ToastComp />
            <AppContextMenuComp />
            <HandleAlertComp />
            <AppPopupWindowsComp />
        </MultiContextRender>
    );
}
