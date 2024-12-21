import HandleAlert from './alert/HandleAlert';
import { main } from './appInitHelpers';
import TopProgressBarComp from './progress-bar/TopProgressBarComp';
import Setting from './setting/Setting';
import Toast from './toast/Toast';

main(<>
    <Setting />
    <TopProgressBarComp />
    <Toast />
    <HandleAlert />
</>
);
