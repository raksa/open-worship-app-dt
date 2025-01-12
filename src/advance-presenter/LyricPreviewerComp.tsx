import { useState } from 'react';

import LyricViewComp from './LyricViewComp';
import { useLyricSelecting } from '../event/PreviewingEventListener';
import Lyric from '../lyric-list/Lyric';
import LyricListComp from '../lyric-list/LyricListComp';
import LyricItem from '../lyric-list/LyricItem';

export default function LyricPreviewerComp() {
    const [lyric, setLyric] = useState<Lyric | null | undefined>(null);
    useLyricSelecting(setLyric);
    const handleLyricChanging = (newLyricItem: LyricItem, index: number) => {
        if (!lyric) {
            return;
        }
        const newLyric = lyric.clone();
        newLyric.items[index] = newLyricItem;
        setLyric(newLyric);
    };
    const handleClosing = (index: number) => {
        if (!lyric) {
            return;
        }
        const newLyric = lyric.clone();
        newLyric.items = newLyric.items.filter((_, i) => {
            return i !== index;
        });
        setLyric(newLyric);
    };
    if (!lyric) {
        return <LyricListComp />;
    }
    const lyricItems = lyric.items;
    if (!lyricItems.length) {
        return <>No Lyric Available</>;
    }
    return (
        <div className="d-flex d-flex-row overflow-hidden w-100 h-100">
            {lyric.isChanged && (
                <button
                    className="btn btn-success"
                    title="Save"
                    onClick={() => {
                        lyric.save();
                    }}
                    style={{
                        width: '20px',
                        padding: '0px',
                    }}
                >
                    <i className="bi bi-save" />
                </button>
            )}
            {lyricItems.map((lyricItem, i) => {
                return (
                    <LyricViewComp
                        key={lyricItem.id}
                        index={i}
                        lyricItem={lyricItem}
                        lyricItems={lyricItems}
                        onLyricChange={handleLyricChanging}
                        onClose={handleClosing}
                    />
                );
            })}
            <button
                className="btn btn-info"
                title="Add More Lyric"
                style={{
                    width: '20px',
                    padding: '0px',
                }}
                onClick={() => {
                    const newLyric = lyric.clone();
                    newLyric.items.push(lyricItems[0].clone());
                    setLyric(newLyric);
                }}
            >
                <i className="bi bi-plus" />
            </button>
        </div>
    );
}
