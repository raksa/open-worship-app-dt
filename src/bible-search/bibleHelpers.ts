import { useEffect, useState } from 'react';
import { getSetting, setSetting } from '../helper/settingHelper';
import bibleHelper from '../bible-helper/bibleHelpers';
import { toastEventListener } from '../event/ToastEventListener';
import BibleItem from '../bible-list/BibleItem';

export async function getSelectedEditingBibleItem(bibleItem: BibleItem | null) {
    if (bibleItem !== null) {
        return bibleItem.bibleName;
    }
    const bibleName = getSetting('selected-bible') || null;
    if (bibleName === null) {
        const bibleNames = await bibleHelper.getDownloadedBibleList();
        if (!bibleNames || !bibleNames.length) {
            toastEventListener.showSimpleToast({
                title: 'Getting Selected Bible',
                message: 'Unable to get selected bible',
            });
            return null;
        }
        setSetting('selected-bible', bibleNames[0]);
        return bibleNames[0];
    }
    return bibleName;
}

export function useGetSelectedBibleItem(bibleItem: BibleItem | null) {
    const [bibleNameSelected, setBibleNameSelected] = useState<string | null>(null);
    useEffect(() => {
        getSelectedEditingBibleItem(bibleItem).then((bibleName) => {
            setBibleNameSelected(bibleName);
        });
    });
    return [bibleNameSelected, setBibleNameSelected] as [string | null, (b: string | null) => void];
}

export function useGetDefaultInputText(bibleItem: BibleItem | null) {
    const [inputText, setInputText] = useState<string>('');
    useEffect(() => {
        if (bibleItem !== null) {
            BibleItem.itemToTitle(bibleItem).then((text) => {
                setInputText(text);
            });
        }
    }, [bibleItem]);
    return [inputText, setInputText] as [string, (s: string) => void];
}
