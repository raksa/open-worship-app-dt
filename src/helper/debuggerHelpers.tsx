import {
    DependencyList, EffectCallback, useEffect, useMemo, useState,
} from 'react';

import { log, warn } from './loggerHelpers';

const THRESHOLD = 10;
const MILLIE_SECOND = 1000;

type StoreType = {
    count: number,
    timeoutId: any,
};
function restore(toKey: string) {
    const store = (storeMapper.get(toKey) || {
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
        storeMapper.set(toKey, {
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

const storeMapper = new Map<string, StoreType>();
function checkStore(toKey: string) {
    const store = restore(toKey);
    storeMapper.set(toKey, store);
    if (store.count > THRESHOLD) {
        warn(
            `[useAppEffect] ${toKey} is called more than `
            + `${THRESHOLD} times in ${MILLIE_SECOND}ms`,
        );
    }
}

type MethodContextType = { [key: string]: any }
export function useAppEffectAsync<T extends MethodContextType>(
    effect: (methodContext: T) => (
        void | (() => void) | Promise<void>
    ),
    deps?: DependencyList,
    context?: {
        key?: string,
        methods?: T,
    },
) {
    const toKey = useMemo(() => {
        return context?.key ?? effect.toString();
    }, []);
    const toEffect = (methodContext: T) => {
        checkStore(toKey);
        return effect(methodContext);
    };
    const totalDeps = (!deps && !context?.methods) ? undefined : [
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
    }, totalDeps);
}

export function useAppEffect(
    effect: EffectCallback,
    deps?: DependencyList,
    key?: string,
) {
    const toKey = useMemo(() => {
        return key ?? effect.toString();
    }, []);
    useEffect(() => {
        checkStore(toKey);
        return effect();
    }, deps);
}

function TestInfinite() {
    const [count, setCount] = useState(0);
    const [isStopped, setIsStopped] = useState(false);
    useAppEffect(() => {
        if (isStopped) {
            return;
        }
        setTimeout(() => {
            setCount(count + 1);
        }, 10);
    }, [count], 'test');
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
