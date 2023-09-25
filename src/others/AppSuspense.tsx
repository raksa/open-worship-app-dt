import { ReactNode, Suspense } from 'react';

export default function AppSuspense({ children }: {
    children: ReactNode,
}) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            {children}
        </Suspense>
    );
}
