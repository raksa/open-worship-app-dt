import { VAlignmentType, HAlignmentType } from '../canvasHelpers';

export default function ToolAlign({ onData, isText }: Readonly<{
    onData: (data: {
        verticalAlignment?: VAlignmentType,
        horizontalAlignment?: HAlignmentType,
    }) => void,
    isText?: boolean,
}>) {
    return (
        <div>
            <button className='btn btn-info' onClick={() => {
                onData({ verticalAlignment: 'start' });
            }}><i className='bi bi-align-top' /></button>
            <button className='btn btn-info' onClick={() => {
                onData({ verticalAlignment: 'center' });
            }}><i className='bi bi-align-middle' /></button>
            <button className='btn btn-info' onClick={() => {
                onData({ verticalAlignment: 'end' });
            }}><i className='bi bi-align-bottom' /></button>
            <hr />
            {isText ? <>
                <button className='btn btn-info' onClick={() => {
                    onData({ horizontalAlignment: 'left' });
                }}><i className='bi bi-text-left' /></button>
                <button className='btn btn-info' onClick={() => {
                    onData({ horizontalAlignment: 'center' });
                }}><i className='bi bi-text-center' /></button>
                <button className='btn btn-info' onClick={() => {
                    onData({ horizontalAlignment: 'right' });
                }}><i className='bi bi-text-right' /></button>
            </> : <>
                <button className='btn btn-info' onClick={() => {
                    onData({ horizontalAlignment: 'left' });
                }}><i className='bi bi-align-start' /></button>
                <button className='btn btn-info' onClick={() => {
                    onData({ horizontalAlignment: 'center' });
                }}><i className='bi bi-align-center' /></button>
                <button className='btn btn-info' onClick={() => {
                    onData({ horizontalAlignment: 'right' });
                }}><i className='bi bi-align-end' /></button>
            </>}
        </div>
    );
}
