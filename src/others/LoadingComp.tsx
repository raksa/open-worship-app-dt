export default function LoadingComp() {
    return (
        <div
            className='d-flex flex-wrap w-100 h-100'>
            <div style={{ margin: 'auto' }}>
                <img style={{
                    maxWidth: '70px',
                }} src='/public/loading.gif' alt='Loading...' />
            </div>
        </div>
    );
}