import { useState } from 'react';
import {
    previewingEventListener,
} from '../event/PreviewingEventListener';
import {
    getBiblePresentingSetting,
    setBiblePresentingSetting,
} from '../helper/settingHelper';
import { BiblePresentType } from '../full-text-present/previewingHelper';
import { convertPresent } from '../full-text-present/FullTextPresentController';
import { showAppContextMenu } from '../others/AppContextMenu';
import bibleHelper, { useGetBibleWithStatus } from '../bible-helper/bibleHelpers';
import { usePresentRenderTitle } from '../bible-helper/helpers1';
import { cloneObject } from '../helper/helpers';
import BibleItemColorNote from './BibleItemColorNote';

export function presentBible(item: BiblePresentType) {
    setBiblePresentingSetting(convertPresent(item, getBiblePresentingSetting()));
    previewingEventListener.presentBible(item);
}

export default function BibleItem({ index, groupIndex, biblePresent, warningMessage,
    onContextMenu, onUpdateBiblePresent, onDragOnIndex }: {
        index: number,
        groupIndex: number,
        biblePresent: BiblePresentType,
        warningMessage?: string,
        onContextMenu?: (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => void,
        onUpdateBiblePresent?: (newBiblePresent: BiblePresentType) => void,
        onDragOnIndex?: (index: number) => void,
    }) {
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const title = usePresentRenderTitle(biblePresent);
    const bibleStatus = useGetBibleWithStatus(biblePresent.bible);
    const changeBible = onUpdateBiblePresent ? (newBible: string) => {
        biblePresent.bible = newBible;
        onUpdateBiblePresent(biblePresent);
    } : null;
    return (
        <li className={`list-group-item item ${isDraggingOver ? 'drag-receiving' : ''}`}
            data-index={index + 1}
            draggable
            onDragStart={(event) => {
                const newBiblePresent = cloneObject(biblePresent) as any;
                newBiblePresent.index = index;
                newBiblePresent.groupIndex = groupIndex;
                event.dataTransfer.setData('text/plain', JSON.stringify(newBiblePresent));
            }}
            onDragOver={(event) => {
                event.preventDefault();
                setIsDraggingOver(true);
            }}
            onDragLeave={(event) => {
                event.preventDefault();
                setIsDraggingOver(false);
            }}
            onDrop={(event) => {
                const receivedData = event.dataTransfer.getData('text');
                try {
                    const dropBiblePresent = JSON.parse(receivedData) as BiblePresentType;
                    if (onDragOnIndex && dropBiblePresent.index !== undefined) {
                        onDragOnIndex(+dropBiblePresent.index);
                    }
                } catch (error) {
                    console.log(error);
                }
                setIsDraggingOver(false);
            }}
            onContextMenu={onContextMenu || (() => false)}
            onClick={() => presentBible(biblePresent)}>
            <span className={changeBible ? 'bible' : ''} onClick={async (e) => {
                if (!changeBible) {
                    return;
                }
                e.stopPropagation();
                const bibleList = await bibleHelper.getBibleListWithStatus();
                const currentBible = biblePresent.bible;
                const bibleListFiltered = bibleList.filter(([bible]) => currentBible !== bible);
                showAppContextMenu(e, bibleListFiltered.map(([bible, isAvailable]) => {
                    return {
                        title: bible, disabled: !isAvailable, onClick: () => {
                            changeBible(bible);
                        },
                    };
                }));
            }}>
                <i className="bi bi-bookmark" />
                {bibleStatus === null ? null : bibleStatus[2]}
            </span> | {title == null ? 'not found' : title}
            {warningMessage && <span className='float-end' title={warningMessage}>⚠️</span>}
            <BibleItemColorNote
                biblePresent={biblePresent}
                onUpdateBiblePresent={onUpdateBiblePresent} />
        </li >
    );
}
