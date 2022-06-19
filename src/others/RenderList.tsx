import DirSource from '../helper/DirSource';

export default function RenderList({ dirSource, body }: {
    dirSource: DirSource,
    body: any,
}) {
    if (dirSource.fileSources === undefined) {
        return (
            <div className='alert alert-warning pointer'
                onClick={() => dirSource.clearFileSources()}>
                Fail To Get File List
            </div>
        );
    }
    if (dirSource.fileSources === null) {
        return (
            <div className='alert alert-info'>
                Getting File List
            </div>
        );

    }
    return body;
}