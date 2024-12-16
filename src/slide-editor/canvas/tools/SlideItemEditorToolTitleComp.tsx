export default function SlideItemEditorToolTitleComp({
    title, children,
}: Readonly<{
    title?: string, children: any,
}>) {
    return (
        <div className='app-tool m-1'>
            {title && <div style={{
                borderBottom: '1px solid #cccccc2f',
            }}>{title}</div>}
            <div className='p-1'>{children}</div>
        </div>
    );
}
