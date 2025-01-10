import { main } from './appInitHelpers';
import AppPresenter from './AppPresenter';
import AppLayout from './router/AppLayout';

main(
    <AppLayout>
        <AppPresenter />
    </AppLayout>,
);
