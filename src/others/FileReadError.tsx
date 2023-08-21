export default function FileReadError({
    onContextMenu,
}: {
    onContextMenu?: (event: any) => void,
}) {
    return (
        <div className='card pointer'
            onContextMenu={onContextMenu} >
            <div className='card-body'>
                <div className='alert alert-danger'>
                    Fail to read file data
                </div>
            </div>
        </div>
    );
}
