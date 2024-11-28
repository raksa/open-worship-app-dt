import './ProgressBar.scss';

import { useState } from 'react';

import {
    useHideProgressBar, useShowProgressBar,
} from '../event/ProgressBarEventListener';

export default function ProgressBar() {
    const [progressKeys, setProgressKeys] = useState<string[]>([]);
    const addProgressKey = (progressKey: string) => {
        setProgressKeys((prev) => {
            if (prev.includes(progressKey)) {
                return prev;
            }
            return [...prev, progressKey];
        });
    };
    useShowProgressBar((progressKey: string) => {
        addProgressKey(progressKey);
    });
    useHideProgressBar((progressKey: string) => {
        setProgressKeys((prev) => prev.filter((key) => key !== progressKey));
    });
    if (progressKeys.length === 0) {
        return null;
    }
    return (
        <div className='app-top-progress-bar progress'
            title={`Progress: ${progressKeys.join(',')}`}
        >
            <div className={
                'progress-bar progress-bar-striped ' +
                'progress-bar-animated bg-success'
            }
                role='progressbar'
                aria-valuenow={100}
                aria-valuemin={0}
                aria-valuemax={100}
                style={{
                    width: '100%',
                }}
            />
        </div>
    );
}
