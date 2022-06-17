import './SlideList.scss';

import { useState } from 'react';
import { useStateSettingString } from '../helper/settingHelper';
import FileSource from '../helper/FileSource';
import FileListHandler from '../others/FileListHandler';
import { getAllDisplays } from '../helper/displayHelper';
import SlideItem from './SlideItem';
import Slide from './Slide';

const id = 'slide-list';
export default function SlideList() {
    const [list, setList] = useState<FileSource[] | null>(null);
    const [dir, setDir] = useStateSettingString(`${id}-selected-dir`, '');
    return (
        <FileListHandler id={id} mimetype={'slide'}
            list={list} setList={setList}
            dir={dir} setDir={setDir}
            onNewFile={async (name) => {
                if (name !== null) {
                    const data = Slide.defaultSlide();
                    const isSuccess = await Slide.createNew(dir, name, data);
                    if (isSuccess) {
                        setList(null);
                        return false;
                    }
                }
                return true;
            }}
            header={<span>Slides</span>}
            body={<>
                {(list || []).map((fileSource, i) => {
                    return <SlideItem key={`${i}`}
                        index={i}
                        fileSource={fileSource}
                        list={list} setList={setList} />;
                })}
            </>} />
    );
}
