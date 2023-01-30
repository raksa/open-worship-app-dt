import { useState } from 'react';
import { useAppEffect } from '../helper/debuggerHelpers';
import DirSource from '../helper/DirSource';
import { useDSEvents } from '../helper/dirSourceHelpers';
import FileSource from '../helper/FileSource';
import { MimetypeNameType } from '../server/fileHelper';

export default function RenderList({
    dirSource,
    mimetype,
    bodyHandler,
}: {
    dirSource: DirSource,
    mimetype: MimetypeNameType,
    bodyHandler: (fileSources: FileSource[]) => any,
}) {
    const [fileSources, setFileSources] = useState<
        FileSource[] | null | undefined>(null);
    const refresh = () => {
        dirSource.getFileSources(mimetype).then((newFileSources) => {
            setFileSources(newFileSources);
        });
    };
    useAppEffect(() => {
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
                onClick={() => {
                    dirSource.fireReloadEvent();
                }}>
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
    const fileSourceColorMap: { [key: string]: FileSource[] } = {};
    fileSources.forEach((fileSource) => {
        const colorNote = fileSource.colorNote || 'unknown';
        fileSourceColorMap[colorNote] = fileSourceColorMap[colorNote] || [];
        fileSourceColorMap[colorNote].push(fileSource);
    });
    if (Object.keys(fileSourceColorMap).length === 1) {
        return bodyHandler(fileSources);
    }
    const keys = Object.keys(fileSourceColorMap);
    // "unknown" should be at the end
    keys.sort((a, b) => {
        if (a === 'unknown') {
            return 1;
        }
        if (b === 'unknown') {
            return -1;
        }
        return 0;
    });
    return (
        <>{keys.map((colorNote) => {
            const subFileSources = fileSourceColorMap[colorNote];
            return (
                <div key={colorNote}>
                    {colorNote === 'unknown' ? <hr /> :
                        <hr style={{
                            backgroundColor: colorNote,
                            height: '1px',
                            border: 0,
                        }} />}
                    {bodyHandler(subFileSources)}
                </div>
            );
        })}
        </>
    );
}
