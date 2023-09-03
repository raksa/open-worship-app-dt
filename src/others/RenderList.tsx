import { useState } from 'react';
import { useAppEffect } from '../helper/debuggerHelpers';
import DirSource from '../helper/DirSource';
import { useDSEvents } from '../helper/dirSourceHelpers';
import FileSource from '../helper/FileSource';
import { MimetypeNameType } from '../server/fileHelper';

const UNKNOWN = 'unknown';

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
        dirSource.getFileSources(mimetype).then(async (newFileSources) => {
            if (newFileSources !== undefined) {
                const promises = newFileSources.map(async (fileSource) => {
                    const color = await fileSource.getColorNote();
                    fileSource.colorNote = color;
                });
                await Promise.all(promises);
            }
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
    const fileSourceColorMap: { [key: string]: FileSource[] } = {
        [UNKNOWN]: [],
    };
    fileSources.forEach((fileSource) => {
        const colorNote = fileSource.colorNote || UNKNOWN;
        fileSourceColorMap[colorNote] = fileSourceColorMap[colorNote] || [];
        fileSourceColorMap[colorNote].push(fileSource);
    });
    if (Object.keys(fileSourceColorMap).length === 1) {
        return bodyHandler(fileSources);
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
