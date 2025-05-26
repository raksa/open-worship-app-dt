import KeyboardEventListener from '../event/KeyboardEventListener';
import { MutationType, APP_FULL_VIEW_CLASSNAME } from './helpers';

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
