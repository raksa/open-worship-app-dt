import { FileListType } from './FileListHandler';

export default function RenderList({ list, setList, body }: {
    list: FileListType,
    setList: (l: FileListType) => void,
    body: any,
}) {
    if (list === undefined) {
        return (
            <div className='alert alert-warning pointer'
                onClick={() => setList(null)}>
                Fail To Get File List
            </div>
        );
    }
    if (list === null) {
        return (
            <div className='alert alert-info'>
                Getting File List
            </div>
        );

    }
    return body;
}