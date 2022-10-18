function isToolTip(target: any) {
    return target instanceof HTMLElement
        && target.classList.contains('tool-tip');
}

let isInitialized = false;

export function initToolTip() {
    if (isInitialized) {
        return;
    }
    isInitialized = true;
    document.body.addEventListener('mouseover', function (event) {
        const { target } = event;
        if (isToolTip(target)) {
            const element = target as HTMLElement;
            const toolTipText = getToolTipText(element);
            if (toolTipText && !element.title.includes(toolTipText)) {
                element.title = `(${toolTipText}) ` + element.title;
            }
        }
    });
}

function getToolTipText(target: HTMLElement) {
    return target.dataset['toolTip'];
}
