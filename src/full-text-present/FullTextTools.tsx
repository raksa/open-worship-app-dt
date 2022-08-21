import CustomStyle from './CustomStyle';
import { previewer } from './FullTextPreviewer';
import FTPreviewerUtils from './FTPreviewerUtils';

export default function FullTextTools() {
    return (
        <>
            <FTPreviewerUtils
                onShow={(event) => {
                    previewer.show(event);
                }} />
            <CustomStyle />
        </>
    );
}
