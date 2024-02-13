export default function HeaderAlertPopup({ header, onClose }: Readonly<{
    header: JSX.Element,
    onClose: () => void,
}>) {
    return (
        <div className='card-header text-center w-100'>
            <span>{header}</span>
            <button type='button'
                onClick={() => {
                    onClose();
                }}
                className='btn-close float-end' />
        </div>
    );
}
