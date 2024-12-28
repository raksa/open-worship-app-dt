import HandleAlert from './alert/HandleAlert';
import { main } from './appInitHelpers';
import TopProgressBarComp from './progress-bar/TopProgressBarComp';
import SettingComp from './setting/SettingComp';
import Toast from './toast/Toast';

main(<>
    <SettingComp />
    <TopProgressBarComp />
    <Toast />
    <HandleAlert />
</>
);
