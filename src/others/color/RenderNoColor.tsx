export default function RenderNoColor({ isSelected, onClick }: {
    isSelected: boolean,
    onClick?: (event: MouseEvent) => void,
}) {
    return (
        <div title='no color'
            className='m-1 color-item pointer'
            style={{
                width: '20px',
                height: '15px',
                backgroundColor: '#fff',
                color: 'red',
                border: isSelected ?
                    '3px dashed #fff' : '',
            }}
            onClick={(event) => {
                onClick?.(event as any);
            }}>x</div>
    );
}
