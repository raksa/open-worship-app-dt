import RenderActionButtonsComp from './RenderActionButtonsComp';
import { RenderTitleMaterialComp } from '../bible-reader/BibleViewExtra';
import {
    fontSizeToHeightStyle,
    useBibleViewFontSizeContext,
} from '../helper/bibleViewHelpers';
import { closeCurrentEditingBibleItem } from '../bible-reader/readBibleHelpers';
import { toShortcutKey } from '../event/KeyboardEventListener';
import {
    closeEventMapper,
    useLookupBibleItemControllerContext,
} from '../bible-reader/LookupBibleItemController';

export default function RenderBibleEditingHeader() {
    const fontSize = useBibleViewFontSizeContext();
    const viewController = useLookupBibleItemControllerContext();
    return (
        <div
            className="card-header bg-transparent border-success"
            style={fontSizeToHeightStyle(fontSize)}
        >
            <div className="d-flex w-100 h-100">
                <RenderTitleMaterialComp
                    bibleItem={viewController.selectedBibleItem}
                    onBibleKeyChange={(_oldBibleKey, newBibleKey) => {
                        viewController.applyTargetOrBibleKey(
                            viewController.selectedBibleItem,
                            { bibleKey: newBibleKey },
                        );
                    }}
                />
                <div>
                    <RenderActionButtonsComp />
                </div>
                <div>
                    {viewController.isAlone ? null : (
                        <button
                            className="btn-close"
                            title={`Close [${toShortcutKey(closeEventMapper)}]`}
                            onClick={() => {
                                closeCurrentEditingBibleItem(viewController);
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
