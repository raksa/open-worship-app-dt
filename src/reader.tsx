import HandleAlert from './alert/HandleAlert';
import AppReader from './AppReader';
import AppContextMenu from './others/AppContextMenu';
import ProgressBar from './progress-bar/ProgressBar';
import Toast from './toast/Toast';
import { main } from './appInitHelpers';

main(
    <>
        <AppReader />
        <ProgressBar />
        <Toast />
        <AppContextMenu />
        <HandleAlert />
    </>
);
