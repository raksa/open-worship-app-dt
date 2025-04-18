import { useBibleXMLKeys } from './bibleXMLHelpers';
import BibleXMLImportComp from './BibleXMLImportComp';
import BibleXMLListComp from './BibleXMLListComp';

export default function SettingBibleXMLComp() {
    const { bibleKeysMap, isPending, loadBibleKeys } = useBibleXMLKeys();
    return (
        <div className="w-100 app-border-white-round p-2">
            <BibleXMLListComp
                isPending={isPending}
                bibleKeysMap={bibleKeysMap}
                loadBibleKeys={loadBibleKeys}
            />
            <hr />
            <BibleXMLImportComp loadBibleKeys={loadBibleKeys} />
            <hr />
        </div>
    );
}
