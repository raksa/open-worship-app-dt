import './BibleList.scss';

import { useState } from 'react';
import {
    useStateSettingString,
} from '../helper/settingHelper';
import FileListHandler, { FileListType } from '../others/FileListHandler';
import Bible from './Bible';
import BibleFile from './BibleFile';
import { useBibleAdding } from '../event/PreviewingEventListener';

export default function BibleList() {
    const [list, setList] = useState<FileListType>(null);
    const [dir, setDir] = useStateSettingString<string>(Bible.SELECT_DIR_SETTING, '');
    useBibleAdding((bibleItem) => {
        Bible.addItem(bibleItem).then(() => setList(null));
    });
    return (
        <FileListHandler id={'bible-list'} mimetype={'bible'}
            list={list} setList={setList}
            dir={dir} setDir={setDir}
            onNewFile={async (name) => {
                if (await Bible.create(dir, name)) {
                    setList(null);
                    return false;
                }
                return true;
            }}
            header={<span>Bibles</span>}
            body={<>
                {(list || []).map((data, i) => {
                    return <BibleFile key={`${i}`}
                        index={i}
                        fileSource={data}
                        list={list}
                        setList={setList} />;
                })}
            </>} />
    );
}
