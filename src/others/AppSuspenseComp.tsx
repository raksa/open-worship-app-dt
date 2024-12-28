import { ReactNode, Suspense } from 'react';
import LoadingCompComp from './LoadingCompComp';

export default function AppSuspenseComp({ children }: Readonly<{
    children: ReactNode,
}>) {
    return (
        <Suspense fallback={(
            <LoadingCompComp />
        )}>
            {children}
        </Suspense>
    );
}
