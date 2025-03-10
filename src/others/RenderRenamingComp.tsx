import AskingNewNameComp from './AskingNewNameComp';
import FileSource from '../helper/FileSource';

export default function RenderRenamingComp({
    setIsRenaming,
    filePath,
    renamedCallback,
}: Readonly<{
    setIsRenaming: (value: boolean) => void;
    filePath: string;
    renamedCallback?: (newFileSource: FileSource) => void;
}>) {
    const handleNameApplying = async (newName: string | null) => {
        if (newName === null) {
            setIsRenaming(false);
            return;
        }
        const fileSource = FileSource.getInstance(filePath);
        const newFileSource = await fileSource.renameTo(newName);
        if (newFileSource !== null && renamedCallback !== undefined) {
            renamedCallback(newFileSource);
        }
        setIsRenaming(!newFileSource);
    };
    const fileSource = FileSource.getInstance(filePath);
    return (
        <AskingNewNameComp
            defaultName={fileSource.name}
            applyName={handleNameApplying}
        />
    );
}
