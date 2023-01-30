import { useEffect, useState } from 'react';

const THRESHOLD = 10;

const mapper = new Map<string, number>();
export function useAppEffect(
    effect: React.EffectCallback,
    deps?: React.DependencyList,
    key?: string,
) {
    const toKey = key || effect.toString();
    useEffect(() => {
        const count = (mapper.get(toKey) || 0) + 1;
        const millieSecond = 1000;
        setTimeout(() => {
            mapper.set(toKey, 0);
        }, millieSecond);
        mapper.set(toKey, count);
        if (count > THRESHOLD) {
            console.warn(`[useAppEffect] ${toKey} is called more than `
                + `${THRESHOLD} times in ${millieSecond}ms`);
        }
        return effect();
    }, deps);
}

export function TestInfinite() {
    const [count, setCount] = useState(0);
    useAppEffect(() => {
        setTimeout(() => {
            setCount(count + 1);
        }, 100);
    }, [count], 'test');
    return (
        <h2>Test Infinite {count}</h2>
    );
}
