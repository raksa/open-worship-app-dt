let isInitialized = false;

export function initToolTip() {
    if (isInitialized) {
        return;
    }
    isInitialized = true;
    document.body.addEventListener('mouseover', function (event) {
        const { target } = event;
        const toolTipText = getToolTipText(target);
        if (toolTipText) {
            const element = target as HTMLElement;
            if (!element.title.includes(toolTipText)) {
                element.title = `(${toolTipText}) ` + element.title;
            }
        }
    });
}

function getToolTipText(target: any) {
    if (target instanceof HTMLElement) {
        return target.dataset['toolTip'];
    }
    return '';
}
