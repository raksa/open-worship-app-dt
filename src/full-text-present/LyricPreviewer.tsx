import { useEffect, useState } from 'react';
import { previewer } from './FullTextPreviewer';
import LyricView from './LyricView';
import fullTextPresentHelper from './previewingHelper';
import { cloneObject } from '../helper/helpers';
import { FULL_TEXT_AUTO_SAVE_SETTING } from './Utils';
import { getSetting } from '../helper/settingHelper';
import {
    useLyricSelecting,
} from '../event/PreviewingEventListener';
import Lyric from '../lyric-list/Lyric';
import LyricList from '../lyric-list/LyricList';
import FileReadError from '../others/FileReadError';
import { showAppContextMenu } from '../others/AppContextMenu';
import SavingRenderer from '../lyric-list/SavingRenderer';

let isMounted = false;
export default function LyricPreviewer() {
    const [lyric, setLyric] = useState<Lyric | null | undefined>(null);
    useLyricSelecting(setLyric);
    useEffect(() => {
        if (lyric === null) {
            Lyric.getSelected().then((lr) => {
                setLyric(lr);
            });
        }
    }, [lyric]);
    useEffect(() => {
        isMounted = true;
        previewer.show = async () => {
            if (!isMounted || !lyric) {
                return;
            }
            fullTextPresentHelper.renderLyricsList(lyric);
        };
        if (getSetting(FULL_TEXT_AUTO_SAVE_SETTING) === 'true') {
            previewer.show();
        }
        return () => {
            isMounted = false;
        };
    });
    if (lyric === null) {
        return (
            <LyricList />
        );
    }
    if (lyric === undefined) {
        return (
            <FileReadError onContextMenu={(e) => {
                showAppContextMenu(e, [{
                    title: 'Reload', onClick: () => setLyric(null),
                }]);
            }} />
        );
    }
    const lyricItems = lyric.content.items;
    if (!lyricItems.length) {
        return (
            <>No Lyric Available</>
        );
    }
    return (
        <div className='d-flex d-flex-row overflow-hidden w-100 h-100'>
            <SavingRenderer lyric={lyric} />
            {lyricItems.map((lyricItem, i) => {
                return (
                    <LyricView key={i} i={i}
                        lyricItem={lyricItem}
                        lyricItems={lyricItems}
                        onLyricChange={(newLyricItem) => {
                            const newLyric = lyric.clone<Lyric>();
                            newLyric.content.items[i] = newLyricItem;
                            setLyric(newLyric);
                        }}
                        onClose={() => {
                            const newLyric = lyric.clone<Lyric>();
                            newLyric.content.items = newLyric.content.items.filter((_, i1) => i1 !== i);
                            setLyric(newLyric);
                        }} />
                );
            })}
            <button className="btn btn-info" title='Add More Lyric'
                style={{
                    width: '20px',
                    padding: '0px',
                }}
                onClick={() => {
                    const newLyric = lyric.clone<Lyric>();
                    newLyric.content.items.push(cloneObject(lyricItems[0]));
                    setLyric(newLyric);
                }}>
                <i className="bi bi-plus" />
            </button>
        </div>
    );
}
