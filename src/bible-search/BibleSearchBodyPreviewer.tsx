import BibleItem from '../bible-list/BibleItem';
import {
    BibleItemViewControllerContext, SearchBibleItemViewController,
} from '../read-bible/BibleItemViewController';
import BiblePreviewerRender from '../read-bible/BiblePreviewerRender';
import BibleView from '../read-bible/BibleView';
import RenderBibleSearchBody from './RenderBibleSearchBody';

export default function BibleSearchBodyPreviewer({
    bibleKey, inputText,
}: Readonly<{
    bibleKey: string,
    inputText: string,
}>) {
    const bibleItemViewController = SearchBibleItemViewController.getInstance();
    bibleItemViewController.finalRenderer = (
        bibleItem: BibleItem,
    ) => {
        const isSelected = bibleItemViewController.checkIsBibleItemSelected(
            bibleItem,
        );
        return (
            isSelected ?
                <RenderBibleSearchBody
                    bibleKey={bibleKey}
                    inputText={inputText} /> :
                <BibleView
                    bibleItem={bibleItem}
                />
        );
    };
    return (
        <BibleItemViewControllerContext.Provider
            value={bibleItemViewController}>
            <BiblePreviewerRender />
        </BibleItemViewControllerContext.Provider>
    );
}
