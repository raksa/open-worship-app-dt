import { useEffect, useState } from 'react';
import { previewer } from './Previewer';
import LyricView from './LyricView';
import fullTextPresentHelper from './fullTextPresentHelper';
import { cloneObject } from '../helper/helpers';
import { FULL_TEXT_AUTO_SAVE_SETTING } from './Utils';
import { getSetting } from '../helper/settingHelper';
import {
    useLyricPresenting,
} from '../event/FullTextPresentEventListener';
import { Lyric } from '../helper/lyricHelpers';
import FileSource from '../helper/FileSource';

export default function LyricPreviewer() {
    const [lyricFS, setLyricFS] = useState<FileSource | null>(Lyric.getSelectedLyricFileSource());
    useLyricPresenting((lyric) => {
        setLyricFS(lyric === null ? null : lyric.fileSource);
    });
    useEffect(() => {
        if (lyricFS === null) {
            return;
        }
        const event = lyricFS.registerEventListener('delete', () => {
            setLyricFS(null);
        });
        return () => {
            lyricFS.unregisterEventListener(event);
        };
    }, [lyricFS]);

    return (
        <div className='d-flex d-flex-row overflow-hidden w-100 h-100'>
            <Previewer fileSource={lyricFS} />
        </div>
    );
}
let isMounted = false;
function Previewer({ fileSource }: { fileSource: FileSource | null }) {
    const [lyric, setLyric] = useState<Lyric | null | undefined>(null);
    useEffect(() => {
        Lyric.readFileToData(fileSource).then((lr) => {
            if (!lr) {
                Lyric.clearLyricListEditingIndex();
            }
            setLyric(lr);
        });
    }, [fileSource]);
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
        return null;
    }
    if (lyric === undefined) {
        return (
            <div className="alert alert-warning">
                No Lyric Available
            </div>
        );
    }
    const lyricItems = lyric.content.items;
    if (!lyricItems.length) {
        return (
            <>No Lyric Available</>
        );
    }
    return (
        <>
            <Save lyric={lyric} />
            {lyricItems.map((lyricItem, i) => {
                return (
                    <LyricView key={i} i={i}
                        lyricItem={lyricItem}
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
        </>
    );
}
function Save({ lyric }: { lyric: Lyric }) {
    const [isEditing, setIEditing] = useState(false);
    useEffect(() => {
        Lyric.readFileToDataNoCache(lyric.fileSource).then((lr) => {
            if (lr && JSON.stringify(lyric.content) !== JSON.stringify(lr?.content)) {
                setIEditing(true);
            } else {
                setIEditing(false);
            }
        });
    }, [lyric]);
    if (!isEditing) {
        return null;
    }
    return (
        <button className='btn btn-success' title='Save'
            onClick={async () => {
                if (await lyric.save()) {
                    setIEditing(false);
                }
            }}
            style={{
                width: '20px',
                padding: '0px',
            }}><i className="bi bi-save" />
        </button>
    );
}