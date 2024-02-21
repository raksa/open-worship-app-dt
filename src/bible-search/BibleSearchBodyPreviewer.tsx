import BibleItem from '../bible-list/BibleItem';
import {
    SearchBibleItemViewController,
} from '../read-bible/BibleItemViewController';
import BiblePreviewerRender from '../read-bible/BiblePreviewerRender';
import BibleView from '../read-bible/BibleView';
import RenderBibleSearchBody from './RenderBibleSearchBody';

export default function BibleSearchBodyPreviewer({
    bibleKey, inputText, setInputText,
}: Readonly<{
    bibleKey: string,
    inputText: string,
    setInputText: (newText: string) => void,
}>) {
    const bibleItemViewController = new SearchBibleItemViewController();
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
                    inputText={inputText}
                    setInputText={setInputText} /> :
                <BibleView
                    bibleItem={bibleItem}
                    bibleItemViewController={bibleItemViewController}
                />
        );
    };
    return (
        <BiblePreviewerRender
            bibleItemViewController={bibleItemViewController}
        />
    );
}
