import './BibleSearchPopup.scss';

import { useEffect, useState } from 'react';
import Modal from '../others/Modal';
import BibleItem from '../bible-list/BibleItem';
import BibleSearchRender from './BibleSearchRender';

export default function BibleSearchPopup() {
    const [bibleItem, setBibleItem] = useState<BibleItem | null>(null);
    useEffect(() => {
        BibleItem.getSelectedItemEditing().then((item) => {
            setBibleItem(item || null);
        });
    });
    return (
        <Modal>
            <BibleSearchRender bibleItem={bibleItem} />
        </Modal>
    );
}
