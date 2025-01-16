import AskingNewNameComp from './AskingNewNameComp';
import FileSource from '../helper/FileSource';

export default function RenderRenamingComp({
    setIsRenaming,
    filePath,
}: Readonly<{
    setIsRenaming: (value: boolean) => void;
    filePath: string;
}>) {
    const handleNameApplying = async (name: string | null) => {
        if (name === null) {
            setIsRenaming(false);
            return;
        }
        const fileSource = FileSource.getInstance(filePath);
        const isSuccess = await fileSource.renameTo(name);
        setIsRenaming(!isSuccess);
    };
    const fileSource = FileSource.getInstance(filePath);
    return (
        <AskingNewNameComp
            defaultName={fileSource.name}
            applyName={handleNameApplying}
        />
    );
}
