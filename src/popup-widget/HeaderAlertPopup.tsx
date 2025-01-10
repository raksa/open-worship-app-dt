export default function HeaderAlertPopup({
    header,
    onClose,
}: Readonly<{
    header: React.ReactNode;
    onClose: () => void;
}>) {
    return (
        <div className="card-header text-center w-100">
            <div>{header}</div>
            <button
                type="button"
                onClick={() => {
                    onClose();
                }}
                className="btn-close float-end"
                style={{
                    transform: 'translate(0, -90%)',
                }}
            />
        </div>
    );
}
