import { setSetting } from '../helper/settingHelper';
import { BiblePresentType } from '../full-text-present/previewingHelper';
import { openBibleSearch } from '../bible-search/BibleSearchPopup';
import { showAppContextMenu } from '../others/AppContextMenu';
import BibleItem, { presentBible } from './BibleItem';
import { genDuplicatedMessage } from '../bible-helper/bibleHelpers';

export type BibleGroupType = {
    isOpen: boolean,
    title: string,
    list: BiblePresentType[],
    isDefault?: boolean,
};

export default function RenderBibleList({ group, index, applyGroup }: {
    group: BibleGroupType, index: number,
    applyGroup: (g: BibleGroupType, i: number) => void,
}) {
    const { list } = group;
    return (
        <ul className='list-group'>
            {list.map((item, i1) => {
                return <BibleItem key={`${i1}`}
                    index={i1} groupIndex={index}
                    warningMessage={genDuplicatedMessage(list, item, i1)}
                    biblePresent={item}
                    onUpdateBiblePresent={(newBiblePresent) => {
                        list[i1] = newBiblePresent;
                        applyGroup(group, index);
                    }}
                    onDragOnIndex={(dropIndex: number) => {
                        const newList = [...list];
                        const target = newList.splice(dropIndex, 1)[0];
                        newList.splice(i1, 0, target);
                        group.list = newList;
                        applyGroup(group, index);
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
                                    applyGroup(group, index);
                                },
                            },
                        ]);
                    }} />;
            })}
        </ul>
    );
}
