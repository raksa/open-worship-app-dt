import { useState } from 'react';

import { useAppEffect, useAppEffectAsync } from '../helper/debuggerHelpers';
import LoadingComp from '../others/LoadingComp';
import BibleFindBodyComp from './BibleFindBodyComp';
import { useBibleKeyContext } from '../bible-list/bibleHelpers';
import BibleFindController, {
    BibleFindControllerContext,
} from './BibleFindController';

export default function BibleFindPreviewerComp() {
    const selectedBibleKey = useBibleKeyContext();
    const [bibleKey, setBibleKey] = useState(selectedBibleKey);
    const [bibleFindController, setBibleFindController] = useState<
        BibleFindController | null | undefined
    >(undefined);
    useAppEffect(() => {
        setBibleKey(selectedBibleKey);
    }, [selectedBibleKey]);

    const setBibleKey1 = (_: string, newBibleKey: string) => {
        setBibleFindController(undefined);
        setBibleKey(newBibleKey);
    };
    useAppEffectAsync(
        async (methodContext) => {
            if (bibleKey !== 'Unknown' && bibleFindController === undefined) {
                const apiData1 = await BibleFindController.getInstant(bibleKey);
                methodContext.setBibleFindController(apiData1);
            }
        },
        [bibleFindController, bibleKey],
        { setBibleFindController },
    );
    if (bibleFindController === undefined) {
        return <LoadingComp />;
    }
    if (bibleFindController === null) {
        return (
            <div className="alert alert-warning">
                <i className="bi bi-info-circle" />
                <div className="ms-2">Fail to get find controller!</div>
                <button
                    className="btn btn-info"
                    onClick={() => {
                        setBibleFindController(undefined);
                    }}
                >
                    Reload
                </button>
            </div>
        );
    }

    return (
        <BibleFindControllerContext.Provider value={bibleFindController}>
            <BibleFindBodyComp setBibleKey={setBibleKey1} />
        </BibleFindControllerContext.Provider>
    );
}
