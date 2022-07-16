import {
    VAlignmentEnum, HAlignmentEnum,
} from '../Canvas';

export default function ToolAlign({ onData, isText }: {
    onData: (data: {
        verticalAlignment?: VAlignmentEnum,
        horizontalAlignment?: HAlignmentEnum,
    }) => void,
    isText?: boolean,
}) {
    return (
        <div>
            <button className='btn btn-info' onClick={() => {
                onData({ verticalAlignment: VAlignmentEnum.Top });
            }}><i className='bi bi-align-top' /></button>
            <button className='btn btn-info' onClick={() => {
                onData({ verticalAlignment: VAlignmentEnum.Center });
            }}><i className='bi bi-align-middle' /></button>
            <button className='btn btn-info' onClick={() => {
                onData({ verticalAlignment: VAlignmentEnum.Bottom });
            }}><i className='bi bi-align-bottom' /></button>
            <hr />
            {isText ? <>
                <button className='btn btn-info' onClick={() => {
                    onData({ horizontalAlignment: HAlignmentEnum.Left });
                }}><i className='bi bi-text-left' /></button>
                <button className='btn btn-info' onClick={() => {
                    onData({ horizontalAlignment: HAlignmentEnum.Center });
                }}><i className='bi bi-text-center' /></button>
                <button className='btn btn-info' onClick={() => {
                    onData({ horizontalAlignment: HAlignmentEnum.Right });
                }}><i className='bi bi-text-right' /></button>
            </> : <>
                <button className='btn btn-info' onClick={() => {
                    onData({ horizontalAlignment: HAlignmentEnum.Left });
                }}><i className='bi bi-align-start' /></button>
                <button className='btn btn-info' onClick={() => {
                    onData({ horizontalAlignment: HAlignmentEnum.Center });
                }}><i className='bi bi-align-center' /></button>
                <button className='btn btn-info' onClick={() => {
                    onData({ horizontalAlignment: HAlignmentEnum.Right });
                }}><i className='bi bi-align-end' /></button>
            </>}
        </div>
    );
}
