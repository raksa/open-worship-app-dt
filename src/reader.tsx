import HandleAlertComp from './popup-widget/HandleAlertComp';
import AppReader from './AppReader';
import AppContextMenuComp from './others/AppContextMenuComp';
import TopProgressBarComp from './progress-bar/TopProgressBarComp';
import Toast from './toast/Toast';
import { main } from './appInitHelpers';

main(
    <>
        <AppReader />
        <TopProgressBarComp />
        <Toast />
        <AppContextMenuComp />
        <HandleAlertComp />
    </>,
);
