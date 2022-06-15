import { useEffect, useState } from 'react';
import { previewer } from './Previewer';
import LyricView from './LyricView';
import fullTextPresentHelper from './fullTextPresentHelper';
import { cloneObject } from '../helper/helpers';
import { FULL_TEXT_AUTO_SAVE_SETTING } from './Utils';
import { getDefaultLyricItem } from '../lyric-list/LyricList';
import { getSetting } from '../helper/settingHelper';
import {
    fullTextPresentEventListener,
    useLyricPresenting,
} from '../event/FullTextPresentEventListener';
import { LyricItemType } from '../helper/lyricHelpers';

let isMounted = false;
export default function LyricPreviewer() {
    const defaultLyricItem = getDefaultLyricItem();
    const [lyricPresents, setLyricPresents] = useState<LyricItemType[]>(
        defaultLyricItem !== null ? defaultLyricItem.items : []);
    const applyPresents = (newLyricPresents: LyricItemType[]) => {
        setLyricPresents(newLyricPresents);
        fullTextPresentEventListener.updateLyric(newLyricPresents);
    };
    useLyricPresenting(setLyricPresents);
    useEffect(() => {
        isMounted = true;
        previewer.show = () => {
            if (!isMounted) {
                return;
            }
            fullTextPresentHelper.renderLyricsList(lyricPresents);
        };
        if (getSetting(FULL_TEXT_AUTO_SAVE_SETTING) === 'true') {
            previewer.show();
        }
        return () => {
            isMounted = false;
        };
    });
    if (lyricPresents === null) {
        return (
            <div className="alert alert-warning">No Lyric Available</div>
        );
    }
    return (
        <div className='d-flex d-flex-row overflow-hidden w-100 h-100'>
            {lyricPresents.length ? lyricPresents.map((lyricPresent, i) => {
                return (
                    <LyricView key={`${i}`} lyricItem={lyricPresent}
                        i={i} onLyricChange={(newLyricPresent) => {
                            const newLyricPresents = [...lyricPresents];
                            newLyricPresents[i] = newLyricPresent;
                            applyPresents(newLyricPresents);
                        }}
                        onClose={() => {
                            applyPresents(lyricPresents.filter((_, i1) => i1 !== i));
                        }} />
                );
            }) : 'No Bible Available'}
            {lyricPresents.length && <button className="btn btn-info" onClick={() => {
                const newPresents = lyricPresents.concat(cloneObject(lyricPresents[0]));
                applyPresents(newPresents);
            }}>
                <i className="bi bi-plus" />
            </button>
            }
        </div>
    );
}
