import './BibleList.scss';

import { useState } from 'react';
import {
    useStateSettingString,
} from '../helper/settingHelper';
import FileListHandler from '../others/FileListHandler';
import FileSource from '../helper/FileSource';
import Bible from './Bible';
import BibleFile from './BibleFile';
import { useBibleAdding } from '../event/PreviewingEventListener';

const id = 'bible-list';
export default function BibleList() {
    const [list, setList] = useState<FileSource[] | null>(null);
    const [dir, setDir] = useStateSettingString<string>(`${id}-selected-dir`, '');
    useBibleAdding((bibleItem) => {
        if (bibleItem.fileSource) {
            Bible.updateBibleItem(bibleItem);
        } else {
            Bible.getDefaultBible(dir, list).then(async (bible) => {
                if (bible !== null) {
                    bible.content.items.push(bibleItem);
                    await bible.save();
                    bible.isSelected = true;
                    setList(null);
                }
            });
        }
    });
    return (
        <FileListHandler id={id} mimetype={'bible'}
            list={list} setList={setList}
            dir={dir} setDir={setDir}
            onNewFile={async (name) => {
                if (name !== null) {
                    const isSuccess = await Bible.createNew(dir, name, {
                        items: [],
                        metadata: {},
                    });
                    if (isSuccess) {
                        setList(null);
                        return false;
                    }
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
