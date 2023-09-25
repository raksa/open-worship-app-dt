import {
    DependencyList, EffectCallback, useEffect, useState,
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

const mapper = new Map<string, StoreType>();
export function useAppEffect(
    effect: EffectCallback,
    deps?: DependencyList,
    key?: string,
) {
    const toKey = key || effect.toString();
    const toEffect = () => {
        const store = restore(toKey);
        mapper.set(toKey, store);
        if (store.count > THRESHOLD) {
            warn(`[useAppEffect] ${toKey} is called more than `
                + `${THRESHOLD} times in ${MILLIE_SECOND}ms`);
        }
        return effect();
    };
    useEffect(toEffect, deps);
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
