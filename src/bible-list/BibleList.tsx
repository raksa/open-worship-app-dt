import './BibleList.scss';

import { useState } from 'react';
import {
    fullTextPresentEventListener,
    useBibleAdding,
} from '../event/FullTextPresentEventListener';
import {
    getSetting,
    setSetting,
} from '../helper/settingHelper';
import { toastEventListener } from '../event/ToastEventListener';
import { BiblePresentType } from '../full-text-present/fullTextPresentHelper';
import { openBibleSearch, openBibleSearchEvent } from '../bible-search/BibleSearchPopup';
import { windowEventListener } from '../event/WindowEventListener';
import { showAppContextMenu } from '../others/AppContextMenu';
import { biblePresentToTitle } from '../bible-helper/helpers';
import BibleItem, { genDuplicatedMessage, presentBible } from './BibleItem';

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
function genDefaultGroup(): BibleGroupType {
    return {
        isOpen: true,
        title: 'Default',
        list: [],
    };
}
export function getBibleGroupsSetting() {
    try {
        const str = getSetting('bible-list');
        const bibleList = JSON.parse(str);
        if (bibleList[0].title !== 'Default') {
            throw new Error('Invalid bible groups');
        }
        return bibleList;
    } catch (error) {
        console.log(error);
        return [genDefaultGroup()];
    }
}
export function getDefaultGroup(groups: BibleGroupType[]) {
    const group = groups.find((g) => g.title === 'Default');
    if (group) {
        return { group, index: groups.indexOf(group) };
    }
    return null;
}
function cloneGroup(group: BibleGroupType): BibleGroupType {
    return {
        isOpen: group.isOpen,
        title: group.title,
        list: [...group.list],
    };
}
type BibleGroupType = {
    isOpen: boolean,
    title: string,
    list: BiblePresentType[],
};
export default function BibleList() {
    const [groups, setGroups] = useState<BibleGroupType[]>(getBibleGroupsSetting());
    const applyGroup = (newGroup: BibleGroupType, index: number) => {
        const newGroups = [...groups];
        newGroups[index] = cloneGroup(newGroup);
        applyGroups(newGroups);
    };
    const applyGroups = (newGroups: BibleGroupType[]) => {
        setGroups(newGroups);
        setSetting('bible-list', JSON.stringify(newGroups));
    };
    useBibleAdding(({ biblePresent, index: i }) => {
        const defaultG = getDefaultGroup(groups);
        if (defaultG === null) {
            console.log('Default group not found');
            return;
        }
        const { group: defaultGroup, index } = defaultG;
        if (i !== undefined && groups[i]) {
            defaultGroup.list[i] = biblePresent;
        } else {
            defaultGroup.list.push(biblePresent);
        }
        applyGroup(defaultGroup, index);
    });
    return (
        <div id='bible-list' className='card w-100 h-100'>
            <div className='card-header'>
                <span>Bibles</span>
                <button className='btn btn-sm btn-outline-info float-end' title='new slide list'
                    onClick={() => {
                        windowEventListener.fireEvent(openBibleSearchEvent);
                    }}>
                    <i className='bi bi-file-earmark-plus' />
                </button>
            </div>
            <div className='card-body pb-5' onContextMenu={(e) => {
                showAppContextMenu(e, [
                    {
                        title: 'Delete All', onClick: () => {
                            applyGroups([genDefaultGroup()]);
                        },
                    },
                ]);
            }}>
                <div className='accordion accordion-flush'>

                    {groups.map((group, i) => {
                        const { list } = group;
                        return (
                            <div key={i} className='accordion-item learn-list-item'>
                                <div className='accordion-header' onClick={() => {
                                    group.isOpen = !group.isOpen;
                                    applyGroup(group, i);
                                }}>
                                    <span className='w-100 text-center'>{group.title}</span>
                                </div>
                                <div className={`accordion-collapse collapse ${group.isOpen ? 'show' : ''}`}>
                                    <div className='accordion-body'>
                                        <ul className='list-group'>
                                            {list.map((item, i1) => {
                                                return <BibleItem key={`${i1}`}
                                                    index={i1}
                                                    warningMessage={genDuplicatedMessage(list, item, i1)}
                                                    biblePresent={item}
                                                    onUpdateBiblePresent={(newBiblePresent) => {
                                                        list[i1] = newBiblePresent;
                                                        applyGroup(group, i);
                                                    }}
                                                    onDragOnIndex={(dropIndex: number) => {
                                                        const newList = [...list];
                                                        const target = newList.splice(dropIndex, 1)[0];
                                                        newList.splice(i1, 0, target);
                                                        group.list = newList;
                                                        applyGroup(group, i);
                                                    }}
                                                    onContextMenu={(e) => {
                                                        showAppContextMenu(e, [
                                                            {
                                                                title: 'Open', onClick: () => {
                                                                    presentBible(list[i1]);
                                                                },
                                                            },
                                                            {
                                                                title: 'Edit', onClick: () => {
                                                                    setSetting('bible-list-editing', `${i1}`);
                                                                    openBibleSearch();
                                                                },
                                                            },
                                                            {
                                                                title: 'Delete', onClick: () => {
                                                                    group.list = list.filter((_, i2) => i2 !== i1);
                                                                    applyGroup(group, i);
                                                                },
                                                            },
                                                        ]);
                                                    }} />;
                                            })}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>
        </div>
    );
}
