import { useState } from 'react';

import { useAppEffect } from '../helper/debuggerHelpers';
import DirSource from '../helper/DirSource';
import FileSource from '../helper/FileSource';
import { MimetypeNameType } from '../server/fileHelpers';

const UNKNOWN_COLOR_NOTE = 'unknown';

export default function RenderList({
    dirSource, mimetype, bodyHandler,
}: Readonly<{
    dirSource: DirSource,
    mimetype: MimetypeNameType,
    bodyHandler: (_: string[]) => any,
}>) {
    const [filePaths, setFilePaths] = (
        useState<string[] | null | undefined>(null)
    );
    const refresh = async () => {
        const newFilePaths = await dirSource.getFilePaths(mimetype);
        if (newFilePaths !== undefined) {
            const promises = newFilePaths.map(async (filePath) => {
                const fileSource = FileSource.getInstance(filePath);
                const color = await fileSource.getColorNote();
                fileSource.colorNote = color;
            });
            await Promise.all(promises);
        }
        setFilePaths(newFilePaths);
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
        [UNKNOWN_COLOR_NOTE]: [],
    };
    filePaths.forEach((filePath) => {
        const fileSource = FileSource.getInstance(filePath);
        const colorNote = fileSource.colorNote || UNKNOWN_COLOR_NOTE;
        fileSourceColorMap[colorNote] = fileSourceColorMap[colorNote] || [];
        fileSourceColorMap[colorNote].push(filePath);
    });
    if (Object.keys(fileSourceColorMap).length === 1) {
        return bodyHandler(filePaths);
    }
    const keys = Object.keys(fileSourceColorMap).filter((key) => {
        return key !== UNKNOWN_COLOR_NOTE;
    }).sort((a, b) => a.localeCompare(b));
    keys.push(UNKNOWN_COLOR_NOTE);
    return (
        <>{keys.map((colorNote) => {
            const subFileSources = fileSourceColorMap[colorNote];
            return (
                <div key={colorNote}>
                    <hr style={colorNote === UNKNOWN_COLOR_NOTE ? {} : {
                        backgroundColor: colorNote,
                        height: '1px',
                        border: 0,
                    }}
                    />
                    {bodyHandler(subFileSources)}
                </div>
            );
        })}
        </>
    );
}
