import { ReactNode, Suspense } from 'react';
import LoadingComp from './LoadingComp';

export default function AppSuspense({ children }: Readonly<{
    children: ReactNode,
}>) {
    return (
        <Suspense fallback={(
            <LoadingComp />
        )}>
            {children}
        </Suspense>
    );
}
