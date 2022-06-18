import { useEffect, useState } from 'react';
import { previewer } from './FullTextPreviewer';
import LyricView from './LyricView';
import fullTextPresentHelper from './previewingHelper';
import { cloneObject } from '../helper/helpers';
import { FULL_TEXT_AUTO_SAVE_SETTING } from './Utils';
import { getSetting } from '../helper/settingHelper';
import {
    useLyricPresenting,
} from '../event/PreviewingEventListener';
import FileSource from '../helper/FileSource';
import Lyric from '../lyric-list/Lyric';
import LyricList from '../lyric-list/LyricList';

export default function LyricPreviewer() {
    const [lyricFS, setLyricFS] = useState<FileSource | null>(Lyric.getSelectedLyricFileSource());
    useLyricPresenting((lyric) => {
        setLyricFS(lyric === null ? null : lyric.fileSource);
    });
    useEffect(() => {
        if (lyricFS === null) {
            return;
        }
        const deleteEvent = lyricFS.registerEventListener('delete', () => {
            setLyricFS(null);
        });
        return () => {
            lyricFS.unregisterEventListener(deleteEvent);
        };
    }, [lyricFS]);

    return (
        <div className='d-flex d-flex-row overflow-hidden w-100 h-100'>
            <PreviewerRender fileSource={lyricFS} />
        </div>
    );
}
let isMounted = false;
function PreviewerRender({ fileSource }: {
    fileSource: FileSource | null,
}) {
    const [lyric, setLyric] = useState<Lyric | null | undefined>(null);
    useEffect(() => {
        Lyric.readFileToDataNoCache(fileSource).then((lr) => {
            if (!lr) {
                Lyric.clearSelectedLyric();
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
    if (fileSource === null) {
        return (
            <LyricList />
        );
    }
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
        </>
    );
}
function SavingRenderer({ lyric }: { lyric: Lyric }) {
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
