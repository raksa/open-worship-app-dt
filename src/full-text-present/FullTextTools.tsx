import CustomStyle from './CustomStyle';
import { previewer } from './FullTextPreviewer';
import Utils from './Utils';

export default function FullTextTools() {
    return (
        <>
            <Utils onShow={() => previewer.show()} />
            <CustomStyle />
        </>
    );
}
