import React from 'react';

export default function AppSuspense({ children }: {
    children: React.ReactNode,
}) {
    return (
        <React.Suspense fallback={<div>Loading...</div>}>
            {children}
        </React.Suspense>
    );
}
