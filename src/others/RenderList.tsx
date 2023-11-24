import { useState } from 'react';
import { useAppEffect } from '../helper/debuggerHelpers';
import DirSource from '../helper/DirSource';
import FileSource from '../helper/FileSource';
import { MimetypeNameType } from '../server/fileHelper';

const UNKNOWN = 'unknown';

export default function RenderList({
    dirSource,
    mimetype,
    bodyHandler,
}: Readonly<{
    dirSource: DirSource,
    mimetype: MimetypeNameType,
    bodyHandler: (_: string[]) => any,
}>) {
    const [filePaths, setFilePaths] = useState<string[] | null | undefined>(
        null,
    );
    const refresh = () => {
        dirSource.getFilePaths(mimetype).then(async (newFilePaths) => {
            if (newFilePaths !== undefined) {
                const promises = newFilePaths.map(async (filePath) => {
                    const fileSource = FileSource.getInstance(filePath);
                    const color = await fileSource.getColorNote();
                    fileSource.colorNote = color;
                });
                await Promise.all(promises);
            }
            setFilePaths(newFilePaths);
        });
    };
    useAppEffect(() => {
        if (filePaths === null) {
            refresh();
        }
    }, [filePaths]);
    if (filePaths === undefined) {
        return (
            <div className='alert alert-warning pointer'
                onClick={() => {
                    dirSource.fireReloadEvent();
                }}>
                Fail To Get File List
            </div>
        );
    }
    if (filePaths === null) {
        return (
            <div className='alert alert-info'>
                Getting File List
            </div>
        );

    }
    const fileSourceColorMap: { [key: string]: string[] } = {
        [UNKNOWN]: [],
    };
    filePaths.forEach((filePath) => {
        const fileSource = FileSource.getInstance(filePath);
        const colorNote = fileSource.colorNote || UNKNOWN;
        fileSourceColorMap[colorNote] = fileSourceColorMap[colorNote] || [];
        fileSourceColorMap[colorNote].push(filePath);
    });
    if (Object.keys(fileSourceColorMap).length === 1) {
        return bodyHandler(filePaths);
    }
    const keys = Object.keys(fileSourceColorMap).filter((key) => {
        return key !== UNKNOWN;
    }).sort((a, b) => a.localeCompare(b));
    keys.push(UNKNOWN);
    return (
        <>{keys.map((colorNote) => {
            const subFileSources = fileSourceColorMap[colorNote];
            return (
                <div key={colorNote}>
                    <hr style={colorNote === UNKNOWN ? {} : {
                        backgroundColor: colorNote,
                        height: '1px',
                        border: 0,
                    }} />
                    {bodyHandler(subFileSources)}
                </div>
            );
        })}
        </>
    );
}
