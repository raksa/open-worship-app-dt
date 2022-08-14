import { useEffect, useState } from 'react';
import { previewer } from './FullTextPreviewer';
import LyricView from './LyricView';
import fullTextPresentHelper from '../_present/fullTextPresentHelper';
import { cloneObject } from '../helper/helpers';
import { useLyricSelecting } from '../event/PreviewingEventListener';
import Lyric from '../lyric-list/Lyric';
import LyricList from '../lyric-list/LyricList';

let isMounted = false;
export default function LyricPreviewer() {
    const [lyric, setLyric] = useState<Lyric | null | undefined>(null);
    useLyricSelecting(setLyric);
    useEffect(() => {
        if (lyric === null) {
            Lyric.getSelected().then((lr) => {
                setLyric(lr || undefined);
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
        return () => {
            isMounted = false;
        };
    });
    if (!lyric) {
        return (
            <LyricList />
        );
    }
    const lyricItems = lyric.items;
    if (!lyricItems.length) {
        return (
            <>No Lyric Available</>
        );
    }
    return (
        <div className='d-flex d-flex-row overflow-hidden w-100 h-100'>
            {lyric.isChanged && <button className='btn btn-success' title='Save'
                onClick={() => {
                    lyric.save();
                }}
                style={{
                    width: '20px',
                    padding: '0px',
                }}><i className='bi bi-save' />
            </button>}
            {lyricItems.map((lyricItem, i) => {
                return (
                    <LyricView key={i}
                        lyricItem={lyricItem}
                        lyricItems={lyricItems}
                        onLyricChange={(newLyricItem) => {
                            const newLyric = lyric.clone();
                            newLyric.items[i] = newLyricItem;
                            setLyric(newLyric);
                        }}
                        onClose={() => {
                            const newLyric = lyric.clone();
                            newLyric.items = newLyric.items.filter((_, i1) => i1 !== i);
                            setLyric(newLyric);
                        }} />
                );
            })}
            <button className='btn btn-info' title='Add More Lyric'
                style={{
                    width: '20px',
                    padding: '0px',
                }}
                onClick={() => {
                    const newLyric = lyric.clone();
                    newLyric.items.push(cloneObject(lyricItems[0]));
                    setLyric(newLyric);
                }}>
                <i className='bi bi-plus' />
            </button>
        </div>
    );
}
