import React, { Context } from 'react';

export type ContextPairType<T> = {
    context: Context<T>,
    value: T,
}

export function MultiContextRender({
    contexts, children,
}: Readonly<{
    contexts: ContextPairType<any>[],
    children: React.ReactNode,
}>) {
    let result = children;
    for (const { context, value } of contexts) {
        result = (
            <context.Provider value={value}>
                {result}
            </context.Provider>
        );
    }
    return result;
}
