export default function Tool({ title, children }: Readonly<{
    title?: string, children: any,
}>) {
    return (
        <div className='app-tool'>
            {title && <div>{title}</div>}
            <div>{children}</div>
        </div>
    );
}
