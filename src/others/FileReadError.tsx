export default function FileReadError({
    onContextMenu,
}: {
    onContextMenu?: (e: any) => void,
}) {
    return (
        <div className='card pointer' onContextMenu={onContextMenu} >
            <div className='card-header' >file error </div>
        </div>
    );
}