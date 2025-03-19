import { useState } from 'react';

import { APIDataType } from './bibleSearchHelpers';
import { useAppEffectAsync } from '../helper/debuggerHelpers';
import { appApiFetch } from '../helper/networkHelpers';
import { handleError } from '../helper/errorHelpers';
import LoadingComp from '../others/LoadingComp';
import BibleSearchBodyComp from './BibleSearchBodyComp';

async function loadApiData() {
    try {
        const content = await appApiFetch('bible-online-info.json');
        const json = await content.json();
        if (typeof json.mapper !== 'object') {
            throw new Error('Cannot get bible list');
        }
        return json as APIDataType;
    } catch (error) {
        handleError(error);
    }
    return null;
}

export default function BibleSearchPreviewerComp() {
    const [apiData, setApiData] = useState<APIDataType | null | undefined>(
        undefined,
    );
    useAppEffectAsync(
        async (methodContext) => {
            if (apiData === undefined) {
                const apiData1 = await loadApiData();
                methodContext.setApiData(apiData1);
            }
        },
        [apiData],
        { setApiData },
    );
    if (apiData === undefined) {
        return <LoadingComp />;
    }
    if (apiData === null) {
        return (
            <div className="alert alert-warning">
                <i className="bi bi-info-circle" />
                <div className="ms-2">Fail to get api data!</div>
                <button
                    className="btn btn-info"
                    onClick={() => {
                        setApiData(undefined);
                    }}
                >
                    Reload
                </button>
            </div>
        );
    }

    return <BibleSearchBodyComp apiData={apiData} />;
}
