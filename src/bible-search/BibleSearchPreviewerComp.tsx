import { useState } from 'react';

import { useAppEffect, useAppEffectAsync } from '../helper/debuggerHelpers';
import LoadingComp from '../others/LoadingComp';
import BibleSearchBodyComp from './BibleSearchBodyComp';
import { useBibleKeyContext } from '../bible-list/bibleHelpers';
import BibleSearchController, {
    BibleSearchControllerContext,
} from './BibleSearchController';

export default function BibleSearchPreviewerComp() {
    const selectedBibleKey = useBibleKeyContext();
    const [bibleKey, setBibleKey] = useState(selectedBibleKey);
    const [bibleSearchController, setBibleSearchController] = useState<
        BibleSearchController | null | undefined
    >(undefined);
    useAppEffect(() => {
        setBibleKey(selectedBibleKey);
    }, [selectedBibleKey]);

    const setBibleKey1 = (_: string, newBibleKey: string) => {
        setBibleSearchController(undefined);
        setBibleKey(newBibleKey);
    };
    useAppEffectAsync(
        async (methodContext) => {
            if (bibleKey !== 'Unknown' && bibleSearchController === undefined) {
                const apiData1 =
                    await BibleSearchController.getInstant(bibleKey);
                methodContext.setSearchController(apiData1);
            }
        },
        [bibleSearchController, bibleKey],
        { setSearchController: setBibleSearchController },
    );
    if (bibleSearchController === undefined) {
        return <LoadingComp />;
    }
    if (bibleSearchController === null) {
        return (
            <div className="alert alert-warning">
                <i className="bi bi-info-circle" />
                <div className="ms-2">Fail to get search controller!</div>
                <button
                    className="btn btn-info"
                    onClick={() => {
                        setBibleSearchController(undefined);
                    }}
                >
                    Reload
                </button>
            </div>
        );
    }

    return (
        <BibleSearchControllerContext.Provider value={bibleSearchController}>
            <BibleSearchBodyComp setBibleKey={setBibleKey1} />
        </BibleSearchControllerContext.Provider>
    );
}
