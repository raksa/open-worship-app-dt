import CustomStyle from './CustomStyle';
import { previewer } from './FullTextPreviewer';
import FTPreviewerUtils from './FTPreviewerUtils';
import { useCallback } from 'react';

export default function FullTextTools() {
    const onShowCallback = useCallback((event: any) => {
        previewer.show(event);
    }, []);
    return (
        <>
            <FTPreviewerUtils
                onShow={onShowCallback} />
            <CustomStyle />
        </>
    );
}
