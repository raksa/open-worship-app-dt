import Bible from './Bible';
import BibleItemRenderComp from './BibleItemRenderComp';
import { genDuplicatedMessage } from './bibleItemHelpers';
import { useShowBibleLookupContext } from '../others/commonButtons';

export default function RenderBibleItemsComp({
    bible,
}: Readonly<{
    bible: Bible;
}>) {
    const showBibleLookupPopup = useShowBibleLookupContext();
    const items = bible.items;
    return (
        <ul
            className="list-group"
            style={{
                minWidth: '220px',
                maxWidth: '380px',
            }}
        >
            {items.map((bibleItem, i1) => {
                return (
                    <BibleItemRenderComp
                        key={`${bibleItem.id}`}
                        index={i1}
                        warningMessage={genDuplicatedMessage(
                            items,
                            bibleItem,
                            i1,
                        )}
                        bibleItem={bibleItem}
                    />
                );
            })}
            {bible.isDefault && showBibleLookupPopup !== null && (
                <button
                    type="button"
                    className={
                        'btn btn-sm btn-labeled btn-outline-primary p-2 ' +
                        'pointer app-border-white-round'
                    }
                    style={{
                        margin: 'auto',
                        fontSize: '0.8rem',
                    }}
                    onClick={() => {
                        showBibleLookupPopup();
                    }}
                >
                    <span title="Need translation">(*T)</span>Add Bible Item
                </button>
            )}
        </ul>
    );
}
