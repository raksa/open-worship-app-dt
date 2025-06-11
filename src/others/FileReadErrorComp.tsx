export default function FileReadErrorComp({
    onContextMenu,
}: Readonly<{
    onContextMenu?: (event: any) => void;
}>) {
    return (
        <div
            className="card app-caught-hover-pointer"
            onContextMenu={onContextMenu}
        >
            <div className="card-body">
                <div className="alert alert-danger">Fail to read file data</div>
            </div>
        </div>
    );
}
