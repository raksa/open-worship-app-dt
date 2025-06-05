import KeyboardEventListener from '../event/KeyboardEventListener';
import {
    MutationType,
    APP_FULL_VIEW_CLASSNAME,
    APP_AUTO_HIDE_CLASSNAME,
} from './helpers';

const callBackListeners = new Set<
    (element: Node, type: MutationType) => void
>();
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
                for (const callback of callBackListeners) {
                    callback(node, 'added');
                }
            });
        } else if (mutation.type === 'attributes') {
            for (const callback of callBackListeners) {
                callback(mutation.target, 'attr-modified');
            }
        }
    });
});
observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
});
export function onDomChange(
    callback: (element: Node, type: MutationType) => void,
) {
    callBackListeners.add(callback);
}

export function handleFullWidgetView(element: Node, type: MutationType) {
    if (
        type !== 'attr-modified' ||
        element instanceof HTMLElement === false ||
        !element.classList.contains(APP_FULL_VIEW_CLASSNAME)
    ) {
        return;
    }
    const registeredEvents = KeyboardEventListener.registerEventListener(
        [KeyboardEventListener.toEventMapperKey({ key: 'Escape' })],
        (event: KeyboardEvent) => {
            event.stopPropagation();
            event.preventDefault();
            KeyboardEventListener.unregisterEventListener(registeredEvents);
            element.classList.remove(APP_FULL_VIEW_CLASSNAME);
        },
    );
}

export function handleClassNameAction<T>(
    className: string,
    handle: (target: T) => void,
    element: Node,
    type: MutationType,
) {
    if (
        type !== 'attr-modified' ||
        element instanceof HTMLElement === false ||
        !element.classList.contains(className)
    ) {
        return;
    }
    handle(element as T);
}

export function addClearInputButton(
    target: HTMLInputElement,
    onClick: () => void,
) {
    const targetParent = target.parentElement;
    if (
        targetParent === null ||
        targetParent.querySelector('.custom-clear-input-wrapper')
    ) {
        return;
    }
    const clearButton = document.createElement('i');
    clearButton.className = 'bi bi-x-lg app-caught-hover-pointer';
    clearButton.title = 'Clear input';
    clearButton.style.color = 'red';
    clearButton.onclick = () => {
        onClick();
    };
    const wrapper = document.createElement('div');
    wrapper.className =
        'd-flex justify-content-end align-items-center h-100' +
        ' custom-clear-input-wrapper';
    wrapper.style.position = 'absolute';
    const targetRect = target.getBoundingClientRect();
    const parentRect = targetParent.getBoundingClientRect();
    wrapper.style.right = `${parentRect.right - targetRect.right + 5}px`;
    wrapper.style.zIndex = '5';
    wrapper.appendChild(clearButton);
    targetParent.appendChild(wrapper);
}

export function handleAutoHide(
    targetDom: HTMLDivElement,
    isLeftAligned = true,
) {
    const parentElement = targetDom.parentElement;
    if (parentElement === null) {
        return;
    }
    parentElement.querySelectorAll('.auto-hide-button').forEach((el) => {
        el.remove();
    });
    targetDom.classList.add(APP_AUTO_HIDE_CLASSNAME);
    const clearButton = document.createElement('i');
    clearButton.className =
        'auto-hide-button bi bi-three-dots' +
        ' app-caught-hover-pointer app-round-icon';
    if (isLeftAligned) {
        clearButton.style.left = '5px';
    } else {
        clearButton.style.right = '5px';
    }
    clearButton.style.bottom = '5px';
    clearButton.style.position = 'absolute';
    clearButton.title = '`Show';
    let timeoutId: any = null;
    const mouseEnterListener = () => {
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
        }
    };
    const mouseLeaveListener = () => {
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            timeoutId = null;
            clearButton.style.display = 'block';
            targetDom.classList.remove('auto-hide-show');
            targetDom.removeEventListener('mouseleave', mouseLeaveListener);
            targetDom.removeEventListener('mouseenter', mouseEnterListener);
        }, 2000);
    };
    clearButton.onclick = () => {
        clearButton.style.display = 'none';
        targetDom.classList.add('auto-hide-show');
        targetDom.addEventListener('mouseleave', mouseLeaveListener);
        targetDom.addEventListener('mouseenter', mouseEnterListener);
    };
    parentElement.appendChild(clearButton);
}
