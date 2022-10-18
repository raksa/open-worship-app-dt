import { useEffect, useState } from 'react';
import DirSource from '../helper/DirSource';
import { useDSEvents } from '../helper/dirSourceHelpers';
import FileSource from '../helper/FileSource';
import { MimetypeNameType } from '../server/fileHelper';

export default function RenderList({
    dirSource, mimetype, body,
}: {
    dirSource: DirSource, mimetype: MimetypeNameType,
    body: (fileSources: FileSource[]) => any,
}) {
    const [fileSources, setFileSources] = useState<FileSource[] | null | undefined>(null);
    const refresh = () => {
        dirSource.getFileSources(mimetype).then((newFileSources) => {
            setFileSources(newFileSources);
        });
    };
    useEffect(() => {
        if (fileSources === null) {
            refresh();
        }
    }, [fileSources]);
    useDSEvents(['refresh', 'reload'], dirSource, () => {
        setFileSources(null);
    });
    if (fileSources === undefined) {
        return (
            <div className='alert alert-warning pointer'
                onClick={() => dirSource.fireReloadEvent()}>
                Fail To Get File List
            </div>
        );
    }
    if (fileSources === null) {
        return (
            <div className='alert alert-info'>
                Getting File List
            </div>
        );

    }
    return body(fileSources);
}
