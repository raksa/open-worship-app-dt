import {
    DependencyList, useEffect, useState,
} from 'react';

import { log, warn } from './loggerHelpers';

const THRESHOLD = 10;
const MILLIE_SECOND = 1000;

type StoreType = {
    count: number,
    timeoutId: any,
};
function restore(toKey: string) {
    const store = (mapper.get(toKey) || {
        count: 0,
        timeoutId: 0,
    });
    if (store.count === 0) {
        log('[useAppEffect] is called for the first time');
    }
    store.count++;
    if (store.timeoutId) {
        clearTimeout(store.timeoutId);
    }
    store.timeoutId = setTimeout(() => {
        mapper.set(toKey, {
            count: 0,
            timeoutId: 0,
        });
    }, MILLIE_SECOND);
    return store;
}

function warningMethod(key: string) {
    warn(
        `[useAppEffect] ${key} is called after unmounting`,
    );
};
type MethodContextType = { [key: string]: any }
const mapper = new Map<string, StoreType>();
export function useAppEffect<T extends MethodContextType>(
    effect: (methodContext: T) => (
        void | (() => void) | Promise<void>
    ),
    deps?: DependencyList,
    context?: {
        key?: string,
        methods?: T,
    },
) {
    const toKey = context?.key ?? effect.toString();
    const toEffect = (methodContext: T) => {
        const store = restore(toKey);
        mapper.set(toKey, store);
        if (store.count > THRESHOLD) {
            warn(
                `[useAppEffect] ${toKey} is called more than `
                + `${THRESHOLD} times in ${MILLIE_SECOND}ms`,
            );
        }
        return effect(methodContext);
    };
    const totalDeps: any[] = [
        ...(deps || []), ...Object.values(context?.methods ?? {}),
    ];
    useEffect(() => {
        const methodContext = { ...context?.methods ?? {} };
        const unmount = toEffect(methodContext as T);
        return () => {
            Object.keys(methodContext).forEach((key) => {
                methodContext[key] = warningMethod.bind(null, key);
            });
            if (unmount && typeof unmount === 'function') {
                unmount();
            }
        };
    }, totalDeps.length ? totalDeps : undefined);
}

export function TestInfinite() {
    const [count, setCount] = useState(0);
    const [isStopped, setIsStopped] = useState(false);
    useAppEffect(() => {
        if (isStopped) {
            return;
        }
        setTimeout(() => {
            setCount(count + 1);
        }, 10);
    }, [count], { key: 'test' });
    return (
        <h2>
            <button onClick={() => {
                setIsStopped(true);
            }} disabled={isStopped}>
                {isStopped ? 'Stopped' : 'Stop'}
            </button>
            Count: {count}
        </h2>
    );
}
