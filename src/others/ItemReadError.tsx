export default function ItemReadError({
    onContextMenu,
}: {
    onContextMenu?: (e: any) => void,
}) {
    return (
        <div className='card pointer' onContextMenu={onContextMenu} >
            <div className='card-header' >Item data error </div>
        </div>
    );
}