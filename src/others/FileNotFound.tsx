export default function FileNotFound({ onContextMenu }: {
    onContextMenu?: (e: any) => void,
}) {
    return (
        <div className='card pointer' onContextMenu={onContextMenu} >
            <div className='card-header' > not found </div>
        </div>
    );
}