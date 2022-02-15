import { useState } from 'react';
import { fullTextPresentEventListener } from '../event/FullTextPresentEventListener';
import {
    getBiblePresentingSetting,
    setBiblePresentingSetting,
} from '../helper/settingHelper';
import { BiblePresentType } from '../full-text-present/fullTextPresentHelper';
import { convertPresent } from '../full-text-present/FullTextPresentController';
import { showAppContextMenu } from '../others/AppContextMenu';
import bibleHelper from '../bible-helper/bibleHelper';
import { biblePresentToTitle } from '../bible-helper/helpers';
import { cloneObject } from '../helper/helpers';


export function presentBible(item: BiblePresentType) {
    setBiblePresentingSetting(convertPresent(item, getBiblePresentingSetting()));
    fullTextPresentEventListener.presentBible(item);
}

export default function BibleItem({ index, biblePresent, warningMessage,
    onContextMenu, onChangeBible, onDragOnIndex }: {
        index: number,
        biblePresent: BiblePresentType,
        warningMessage?: string,
        onContextMenu?: (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => void,
        onChangeBible?: (newBible: string) => void,
        onDragOnIndex?: (index: number) => void,
    }) {
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const title = biblePresentToTitle(biblePresent);
    const bibleStatus = bibleHelper.getBibleWithStatus(biblePresent.bible);
    return (
        <li className={`list-group-item item ${isDraggingOver ? 'drag-receiving' : ''}`}
            data-index={index + 1}
            draggable
            onDragStart={(event) => {
                const newBiblePresent = cloneObject(biblePresent);
                newBiblePresent.index = index;
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
            <span className={onChangeBible ? 'bible' : ''} onClick={(e) => {
                if (!onChangeBible) {
                    return;
                }
                e.stopPropagation();
                const bibleList = bibleHelper.getBibleListWithStatus();
                const currentBible = biblePresent.bible;
                const bibleListFiltered = bibleList.filter(([bible]) => currentBible !== bible);
                showAppContextMenu(e, bibleListFiltered.map(([bible, isAvailable]) => {
                    return {
                        title: bible, disabled: !isAvailable, onClick: () => {
                            onChangeBible(bible);
                        },
                    };
                }));
            }}>
                <i className="bi bi-bookmark" />
                {bibleStatus[2]}
            </span> | {title == null ? 'not found' : title}
            {warningMessage && <span className='float-end' title={warningMessage}>⚠️</span>}
        </li >
    );
}

export function genDuplicatedMessage(list: BiblePresentType[], { target }: BiblePresentType, i: number) {
    let warningMessage;
    const duplicated = list.find(({ target: target1 }, i1) => {
        return target.book === target1.book &&
            target.chapter === target1.chapter &&
            target.startVerse === target1.startVerse &&
            target.endVerse === target1.endVerse && i != i1;
    });
    if (duplicated) {
        warningMessage = `Duplicated with item number ${list.indexOf(duplicated) + 1}`;
    }
    return warningMessage;
}