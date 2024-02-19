import BibleItemViewController from './BibleItemViewController';
import BiblePreviewerRender from './BiblePreviewerRender';

export default function BiblePreviewer() {
    const bibleItemViewController = new BibleItemViewController();
    return (
        <BiblePreviewerRender
            bibleItemViewController={bibleItemViewController}
        />
    );
}
