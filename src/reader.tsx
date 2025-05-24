import HandleAlertComp from './popup-widget/HandleAlertComp';
import AppReaderComp from './AppReaderComp';
import AppContextMenuComp from './context-menu/AppContextMenuComp';
import TopProgressBarComp from './progress-bar/TopProgressBarComp';
import ToastComp from './toast/ToastComp';
import { main } from './appInitHelpers';
import { hideAllScreens } from './_screen/screenHelpers';

main(
    <>
        <AppReaderComp />
        <TopProgressBarComp />
        <ToastComp />
        <AppContextMenuComp />
        <HandleAlertComp />
    </>,
);

hideAllScreens();
