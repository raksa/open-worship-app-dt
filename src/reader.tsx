import HandleAlert from './alert/HandleAlert';
import AppReader from './AppReader';
import AppContextMenu from './others/AppContextMenu';
import ProgressBar from './progress-bar/ProgressBar';
import Toast from './toast/Toast';
import { MultiContextRender } from './helper/MultiContextRender';
import {
    goToPath,
    RouteLocationContext, RouteNavigateContext,
} from './router/routeHelpers';
import { main } from './appInitHelpers';

const location = window.location;
main(
    <MultiContextRender contexts={[
        {
            context: RouteNavigateContext,
            value: goToPath,
        },
        {
            context: RouteLocationContext,
            value: location,
        },
    ]}>
        <AppReader />
        <ProgressBar />
        <Toast />
        <AppContextMenu />
        <HandleAlert />
    </MultiContextRender>
);
