import AppEditorComp from './AppEditorComp';
import { main } from './appInitHelpers';
import AppLayoutComp from './router/AppLayoutComp';

main(
    <AppLayoutComp>
        <AppEditorComp />
    </AppLayoutComp>,
);
