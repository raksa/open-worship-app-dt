export default function ItemReadError({
    onContextMenu,
}: {
    onContextMenu?: (event: any) => void,
}) {
    return (
        <div className='card pointer'
            onContextMenu={onContextMenu} >
            <div className='card-header'>
                Item data error
            </div>
        </div>
    );
}
