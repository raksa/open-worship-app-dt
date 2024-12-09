import AppEditor from './AppEditor';
import { main } from './appInitHelpers';
import AppLayout from './router/AppLayout';

main(
    <AppLayout>
        <AppEditor />
    </AppLayout>
);
