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
import { useTranslation } from 'react-i18next';

// https://www.w3.org/wiki/CSS/Properties/color/keywords
import colorList from '../others/color-list.json';

export function presentBible(item: BiblePresentType) {
    setBiblePresentingSetting(convertPresent(item, getBiblePresentingSetting()));
    fullTextPresentEventListener.presentBible(item);
}

export default function BibleItem({ index, biblePresent, warningMessage,
    onContextMenu, onUpdateBiblePresent, onDragOnIndex }: {
        index: number,
        biblePresent: BiblePresentType,
        warningMessage?: string,
        onContextMenu?: (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => void,
        onUpdateBiblePresent?: (newBiblePresent: BiblePresentType) => void,
        onDragOnIndex?: (index: number) => void,
    }) {
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const title = biblePresentToTitle(biblePresent);
    const bibleStatus = bibleHelper.getBibleWithStatus(biblePresent.bible);
    const changeBible = onUpdateBiblePresent ? (newBible: string) => {
        biblePresent.bible = newBible;
        onUpdateBiblePresent(biblePresent);
    } : null;
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
            <span className={changeBible ? 'bible' : ''} onClick={(e) => {
                if (!changeBible) {
                    return;
                }
                e.stopPropagation();
                const bibleList = bibleHelper.getBibleListWithStatus();
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
                {bibleStatus[2]}
            </span> | {title == null ? 'not found' : title}
            {warningMessage && <span className='float-end' title={warningMessage}>⚠️</span>}
            <BibleItemColorNote
                biblePresent={biblePresent}
                onUpdateBiblePresent={onUpdateBiblePresent} />
        </li >
    );
}

function BibleItemColorNote({ biblePresent, onUpdateBiblePresent }: {
    biblePresent: BiblePresentType,
    onUpdateBiblePresent?: (newBiblePresent: BiblePresentType) => void,
}) {
    const { t } = useTranslation();
    let colorNote;
    if (biblePresent.metadata && biblePresent.metadata['colorNote']) {
        colorNote = biblePresent.metadata['colorNote'] as string;
    }
    return (
        <span className={`color-note ${colorNote ? 'active' : ''}`} onClick={(e) => {
            if (!onUpdateBiblePresent) {
                return;
            }
            e.stopPropagation();
            const colors = [...Object.entries(colorList.main), ...Object.entries(colorList.extension)];
            showAppContextMenu(e, [{
                title: t('no color'),
                onClick: () => {
                    biblePresent.metadata = biblePresent.metadata || {};
                    delete biblePresent.metadata['colorNote'];
                },
            }, ...colors.map(([name, colorCode]) => {
                return {
                    title: name,
                    onClick: () => {
                        biblePresent.metadata = biblePresent.metadata || {};
                        biblePresent.metadata['colorNote'] = colorCode;
                        onUpdateBiblePresent(biblePresent);
                    },
                    otherChild: (<span style={{ float: 'right' }}>
                        <i className='bi bi-record-circle' style={{ color: colorCode }} />
                    </span>),
                };
            })]);
        }} >
            <i className='bi bi-record-circle' style={colorNote ? { color: colorNote } : {}} />
        </span>
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