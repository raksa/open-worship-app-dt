import './BibleList.scss';

import { useState } from 'react';
import {
    fullTextPresentEventListener,
    useBibleAdding,
} from '../event/FullTextPresentEventListener';
import {
    getBiblePresentingSetting,
    getSetting,
    setBiblePresentingSetting,
    setSetting,
} from '../helper/settingHelper';
import { toastEventListener } from '../event/ToastEventListener';
import { BiblePresentType } from '../full-text-present/fullTextPresentHelper';
import { openBibleSearch, openBibleSearchEvent } from '../bible-search/BibleSearchPopup';
import { convertPresent } from '../full-text-present/FullTextPresentController';
import { windowEventListener } from '../event/WindowEventListener';
import { showAppContextMenu } from '../others/AppContextMenu';
import bibleHelper from '../bible-helper/bibleHelper';
import { biblePresentToTitle } from '../bible-helper/helpers';

export function addBibleItem(biblePresent: BiblePresentType, openPresent?: boolean) {
    const index = getBibleListEditingIndex() || undefined;
    clearBibleListEditingIndex();
    fullTextPresentEventListener.addBibleItem({ biblePresent, index });
    const title = biblePresentToTitle(biblePresent);
    toastEventListener.showSimpleToast({
        title: 'Bible List',
        message: `${title} is added to list`,
    });
    if (openPresent) {
        presentBible(biblePresent);
    }
}

export function presentBible(item: BiblePresentType) {
    setBiblePresentingSetting(convertPresent(item, getBiblePresentingSetting()));
    fullTextPresentEventListener.presentBible(item);
}

export function BibleItem({ item, onContextMenu }: {
    item: BiblePresentType,
    onContextMenu?: (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => void,
}) {
    const title = biblePresentToTitle(item);
    const bibleStatus = bibleHelper.getBibleWithStatus(item.bible);
    return (
        <li className="list-group-item item"
            draggable
            onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', JSON.stringify(item));
            }}
            onContextMenu={onContextMenu || (() => { })}
            onClick={() => presentBible(item)}>
            <i className="bi bi-bookmark" />
            {bibleStatus[2]} | {title == null ? 'not found' : title}
        </li >
    );
}

export function clearBibleListEditingIndex() {
    setSetting('bible-list-editing', '-1');
}
export function getBibleListEditingIndex() {
    const index = +getSetting('bible-list-editing', '-1');
    if (!isNaN(index) && ~index) {
        return index;
    }
    return null;
}
export function getDefaultBibleList() {
    let defaultBibleList = [];
    try {
        const str = getSetting('bible-list');
        defaultBibleList = JSON.parse(str);
    } catch (error) { }
    return defaultBibleList;
}

export default function BibleList() {
    const [list, setList] = useState<BiblePresentType[]>(getDefaultBibleList());
    const applyList = (newList: BiblePresentType[]) => {
        setList(newList);
        setSetting('bible-list', JSON.stringify(newList));
    };
    useBibleAdding(({ biblePresent, index }) => {
        const newList = [...list];
        if (index !== undefined && list[index]) {
            newList[index] = biblePresent;
        } else {
            newList.push(biblePresent);
        }
        applyList(newList);
    });
    return (
        <div id="bible-list" className="card w-100 h-100">
            <div className="card-header">
                <span>Bibles</span>
                <button className="btn btn-sm btn-outline-info float-end" title="new slide list"
                    onClick={() => {
                        windowEventListener.fireEvent(openBibleSearchEvent);
                    }}>
                    <i className="bi bi-file-earmark-plus" />
                </button>
            </div>
            <div className="card-body pb-5" onContextMenu={(e) => {
                showAppContextMenu(e, [
                    {
                        title: 'Delete All', onClick: () => {
                            applyList([]);
                        },
                    },
                ]);
            }}>
                <ul className="list-group">
                    {list.map((item, i) => {
                        return <BibleItem key={`${i}`} item={item} onContextMenu={(e) => {
                            showAppContextMenu(e, [
                                {
                                    title: 'Open', onClick: () => {
                                        if (list[i]) {
                                            presentBible(list[i]);
                                        }
                                    },
                                },
                                {
                                    title: 'Edit', onClick: () => {
                                        setSetting('bible-list-editing', `${i}`);
                                        openBibleSearch();
                                    },
                                },
                                {
                                    title: 'Delete', onClick: () => {
                                        if (list[i]) {
                                            const newList = list.filter((_, i1) => i1 !== i);
                                            applyList(newList);
                                        }
                                    },
                                },
                            ]);
                        }} />;
                    })}
                </ul>
            </div>
        </div>
    );
}
