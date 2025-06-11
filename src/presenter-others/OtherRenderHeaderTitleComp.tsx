export default function OtherRenderHeaderTitleComp({
    isOpened,
    setIsOpened,
    children,
}: Readonly<{
    isOpened: boolean;
    setIsOpened: (isOpened: boolean) => void;
    children?: React.ReactNode;
}>) {
    return (
        <div
            className="d-flex app-caught-hover-pointer"
            onClick={() => {
                setIsOpened(!isOpened);
            }}
        >
            <i className={'bi bi-chevron-' + (isOpened ? 'down' : 'right')} />
            {children}
        </div>
    );
}
