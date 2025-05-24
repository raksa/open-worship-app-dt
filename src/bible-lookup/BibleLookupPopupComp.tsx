import './BibleLookupPopupComp.scss';

import { useMemo } from 'react';

import RenderBibleLookupComp from './RenderBibleLookupComp';
import { ModalComp } from '../app-modal/ModalComp';
import LookupBibleItemController from '../bible-reader/LookupBibleItemController';
import { BibleItemsViewControllerContext } from '../bible-reader/BibleItemsViewController';

export default function BibleLookupPopupComp() {
    const viewController = useMemo(() => {
        return new LookupBibleItemController();
    }, []);
    return (
        <ModalComp>
            <BibleItemsViewControllerContext value={viewController}>
                <RenderBibleLookupComp />
            </BibleItemsViewControllerContext>
        </ModalComp>
    );
}
