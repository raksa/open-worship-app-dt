import './SlideList.scss';

import { useState } from 'react';
import { useStateSettingString } from '../helper/settingHelper';
import FileListHandler, {
    FileListType,
} from '../others/FileListHandler';
import SlideFile from './SlideFile';
import Slide from './Slide';

const id = 'slide-list';
export default function SlideList() {
    const [list, setList] = useState<FileListType>(null);
    const [dir, setDir] = useStateSettingString<string>(`${id}-selected-dir`, '');
    return (
        <FileListHandler id={id} mimetype={'slide'}
            list={list} setList={setList}
            dir={dir} setDir={setDir}
            onNewFile={async (name) => {
                if (name !== null) {
                    if (await Slide.create(dir, name)) {
                        setList(null);
                        return false;
                    }
                }
                return true;
            }}
            header={<span>Slides</span>}
            body={<>
                {(list || []).map((fileSource, i) => {
                    return <SlideFile key={`${i}`}
                        index={i}
                        fileSource={fileSource}
                        list={list} setList={setList} />;
                })}
            </>} />
    );
}
