import { useEffect, useState } from 'react';
import { previewer } from './FullTextPreviewer';
import LyricView from './LyricView';
import { useLyricSelecting } from '../event/PreviewingEventListener';
import Lyric from '../lyric-list/Lyric';
import LyricList from '../lyric-list/LyricList';
import PresentFTManager from '../_present/PresentFTManager';
import { checkIsFtAutoShow } from './FTPreviewerUtils';

export default function LyricPreviewer() {
    const [lyric, setLyric] = useState<Lyric | null | undefined>(null);
    useLyricSelecting(setLyric);
    useEffect(() => {
        if (lyric === null) {
            Lyric.getSelected().then((lr) => {
                setLyric(lr || undefined);
            });
        }
        previewer.show = (event?: React.MouseEvent) => {
            if (lyric) {
                PresentFTManager.ftLyricSelect(event || null, lyric);
            }
        };
        if (checkIsFtAutoShow()) {
            previewer.show();
        }
        return () => {
            previewer.show = () => void 0;
        };
    }, [lyric]);
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
            {lyric.isChanged && <button className='btn btn-success'
                title='Save'
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
                            newLyric.items = newLyric.items.filter((_, i1) => {
                                return i1 !== i;
                            });
                            setLyric(newLyric);
                        }} />
                );
            })}
            <button className='btn btn-info'
                title='Add More Lyric'
                style={{
                    width: '20px',
                    padding: '0px',
                }}
                onClick={() => {
                    const newLyric = lyric.clone();
                    newLyric.items.push(lyricItems[0].clone());
                    setLyric(newLyric);
                }}>
                <i className='bi bi-plus' />
            </button>
        </div>
    );
}
