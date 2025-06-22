import { FileEditingMenuComp } from '../editing-manager/editingHelpers';
import { useSelectedLyricContext } from './lyricHelpers';

export default function LyricMenuComp() {
    const selectedLyric = useSelectedLyricContext();
    return <FileEditingMenuComp editableDocument={selectedLyric} />;
}
