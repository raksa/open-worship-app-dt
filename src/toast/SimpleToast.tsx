export type SimpleToastType = {
    title: string,
    message: string,
    timeout?: number,
};

export default function SimpleToast({
    onClose, toast, onMouseEnter, onMouseLeave,
}: Readonly<{
    onClose: () => void,
    toast: SimpleToastType,
    onMouseEnter: () => void,
    onMouseLeave: () => void,
}>) {
    return (
        <div className='toast show fade'
            onMouseEnter={() => onMouseEnter()}
            onMouseLeave={() => onMouseLeave()}
            role='alert'
            aria-live='assertive'
            aria-atomic='true'>
            <div className='toast-header'>
                <strong className='me-auto'>
                    {toast.title}
                </strong>
                <button type='button'
                    className='btn-close'
                    data-bs-dismiss='toast'
                    aria-label='Close'
                    onClick={onClose} />
            </div>
            <div className='toast-body app-selectable-text'
                dangerouslySetInnerHTML={{
                    __html: toast.message,
                }} />
        </div>
    );
}
