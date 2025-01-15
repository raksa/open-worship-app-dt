import { main } from './appInitHelpers';
import AppPresenterComp from './AppPresenterComp';
import AppLayoutComp from './router/AppLayoutComp';

main(
    <AppLayoutComp>
        <AppPresenterComp />
    </AppLayoutComp>,
);
