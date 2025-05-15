import './BibleLookupPopupComp.scss';

import RenderBibleLookupComp from './RenderBibleLookupComp';
import { ModalComp } from '../app-modal/ModalComp';

export default function BibleLookupPopupComp() {
    return (
        <ModalComp>
            <RenderBibleLookupComp />
        </ModalComp>
    );
}
