import loading from '../assets/loading.gif';

export default function LoadingCompComp() {
    return (
        <div
            className='d-flex flex-wrap w-100 h-100'>
            <div style={{ margin: 'auto' }}>
                <img style={{
                    maxWidth: '70px',
                }} src={loading} alt='Loading...' />
            </div>
        </div>
    );
}
