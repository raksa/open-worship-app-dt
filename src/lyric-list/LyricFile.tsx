import { useState } from 'react';
import Lyric from './Lyric';
import FileItemHandler from '../others/FileItemHandler';
import FileSource from '../helper/FileSource';

export default function LyricFile({
    index, fileSource,
}: {
    index: number,
    fileSource: FileSource,
}) {
    const [data, setData] = useState<Lyric | null | undefined>(null);
    return (
        <FileItemHandler
            index={index}
            mimetype={'lyric'}
            data={data}
            setData={setData}
            fileSource={fileSource}
            onClick={() => {
                if (data) {
                    Lyric.present(data.isSelected ? null : data);
                    data.isSelected = !data.isSelected;
                }
            }}
            child={<>
                <i className="bi bi-music-note" />
                {fileSource.name}
            </>}
        />
    );
}
