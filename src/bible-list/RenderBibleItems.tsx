import {
    genDuplicatedMessage,
} from '../helper/bible-helpers/serverBibleHelpers';
import Bible from './Bible';
import BibleItemRender from './BibleItemRender';
import { useOpenBibleSearch } from '../bible-search/BibleSearchHeader';

export default function RenderBibleItems({ bible }: {
    bible: Bible,
}) {
    const openBibleSearch = useOpenBibleSearch();
    const items = bible.items;
    return (
        <ul className='list-group' style={{
            minWidth: '220px',
            maxWidth: '380px',
        }}>
            {items.map((bibleItem, i1) => {
                return (
                    <BibleItemRender key={`${bibleItem.id}`}
                        index={i1}
                        warningMessage={
                            genDuplicatedMessage(items, bibleItem, i1)
                        }
                        bibleItem={bibleItem} />
                );
            })}
            {bible.isDefault && <div
                className={
                    'btn btn-sm btn-labeled btn-outline-primary p-2 '
                    + 'pointer border-white-round'
                }
                style={{
                    margin: 'auto',
                    fontSize: '0.8rem',
                }}
                onClick={() => {
                    openBibleSearch();
                }}>
                <span title='Need translation'>(*T)</span>
                Add Bible Item
            </div>}
        </ul>
    );
}
