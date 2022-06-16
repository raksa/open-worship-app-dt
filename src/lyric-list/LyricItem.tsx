import { useState } from 'react';
import { Lyric, validateLyric } from '../helper/lyricHelpers';
import FileItemHandler from '../others/FileItemHandler';
import FileSource from '../helper/FileSource';

export default function LyricItem({
    index, list, setList, fileSource, onClick,
}: {
    index: number,
    list: FileSource[] | null,
    setList: (newList: FileSource[] | null) => void,
    fileSource: FileSource,
    onClick: () => void,
}) {
    const [data, setData] = useState<Lyric | null | undefined>(null);
    const selectedLyricFS = Lyric.getSelectedLyricFileSource();
    const isSelected = !selectedLyricFS || !data ? false :
        data.fileSource.filePath === selectedLyricFS?.filePath;
    return (
        <FileItemHandler
            index={index}
            list={list}
            setList={setList}
            data={data}
            setData={setData}
            fileSource={fileSource}
            className={`playlist-item ${isSelected ? 'active' : ''}`}
            validator={validateLyric}
            onClick={onClick}
            child={<>
                <i className="bi bi-music-note" />
                {fileSource.name}
            </>}
        />
    );
}
