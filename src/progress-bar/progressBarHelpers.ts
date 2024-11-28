import ProgressBarEventListener from '../event/ProgressBarEventListener';

export function showProgressBard(progressKey: string) {
    ProgressBarEventListener.showProgressBard(progressKey);
}

export function hideProgressBard(progressKey: string) {
    ProgressBarEventListener.hideProgressBard(progressKey);
}
