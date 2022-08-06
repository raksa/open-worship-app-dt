import { useState } from 'react';
import Lyric from './Lyric';
import FileItemHandler from '../others/FileItemHandler';
import FileSource, { useFSEvents } from '../helper/FileSource';
import ItemColorNote from '../others/ItemColorNote';
import ItemSource from '../helper/ItemSource';
import { getIsPreviewingLyric } from '../full-text-present/FullTextPreviewer';
import { previewingEventListener } from '../event/PreviewingEventListener';

export default function LyricFile({
    index, fileSource,
}: {
    index: number,
    fileSource: FileSource,
}) {
    const [data, setData] = useState<Lyric | null | undefined>(null);
    useFSEvents(['update', 'history-update', 'edit'], fileSource);
    return (
        <FileItemHandler
            index={index}
            mimetype={'lyric'}
            data={data}
            setData={setData}
            fileSource={fileSource}
            isPointer
            onClick={() => {
                if (data) {
                    if (data.isSelected && !getIsPreviewingLyric()) {
                        previewingEventListener.selectLyric(data);
                        return;
                    }
                    data.isSelected = !data.isSelected;
                }
            }}
            child={<>
                <i className='bi bi-music-note' />
                {fileSource.name}
                {data && data.isChanged && <span
                    style={{ color: 'red' }}>*</span>}
                <ItemColorNote item={data as ItemSource<any>} />
            </>}
        />
    );
}
