import { useState } from 'react';

import { useAppEffect, useAppEffectAsync } from '../helper/debuggerHelpers';
import LoadingComp from '../others/LoadingComp';
import BibleSearchBodyComp from './BibleSearchBodyComp';
import { useBibleKeyContext } from '../bible-list/bibleHelpers';
import SearchController from './SearchController';

export default function BibleSearchPreviewerComp() {
    const selectedBibleKey = useBibleKeyContext();
    const [bibleKey, setBibleKey] = useState(selectedBibleKey);
    const [searchController, setSearchController] = useState<
        SearchController | null | undefined
    >(undefined);
    useAppEffect(() => {
        setBibleKey(selectedBibleKey);
    }, [selectedBibleKey]);

    const setBibleKey1 = (_: string, newBibleKey: string) => {
        setSearchController(undefined);
        setBibleKey(newBibleKey);
    };
    useAppEffectAsync(
        async (methodContext) => {
            if (searchController === undefined) {
                const apiData1 = await SearchController.getInstant(bibleKey);
                methodContext.setSearchController(apiData1);
            }
        },
        [searchController],
        { setSearchController },
    );
    if (searchController === undefined) {
        return <LoadingComp />;
    }
    if (searchController === null) {
        return (
            <div className="alert alert-warning">
                <i className="bi bi-info-circle" />
                <div className="ms-2">Fail to get search controller!</div>
                <button
                    className="btn btn-info"
                    onClick={() => {
                        setSearchController(undefined);
                    }}
                >
                    Reload
                </button>
            </div>
        );
    }

    return (
        <BibleSearchBodyComp
            searchController={searchController}
            setBibleKey={setBibleKey1}
        />
    );
}
