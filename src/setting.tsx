import HandleAlertComp from './popup-widget/HandleAlertComp';
import { main } from './appInitHelpers';
import TopProgressBarComp from './progress-bar/TopProgressBarComp';
import SettingComp from './setting/SettingComp';
import Toast from './toast/Toast';
import AppContextMenuComp from './others/AppContextMenuComp';

main(<>
    <SettingComp />
    <TopProgressBarComp />
    <Toast />
    <HandleAlertComp />
    <AppContextMenuComp />
</>
);
