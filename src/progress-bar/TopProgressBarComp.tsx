import './TopProgressBarComp.scss';

import { useState } from 'react';

import {
    useHideProgressBar,
    useShowProgressBar,
} from '../event/ProgressBarEventListener';
import ProgressBarComp from './ProgressBarComp';

export default function TopProgressBarComp() {
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
        <div className="app-top-progress-bar">
            <ProgressBarComp title={progressKeys.join(',')} />
        </div>
    );
}
