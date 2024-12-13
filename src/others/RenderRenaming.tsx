import AskingNewName from './AskingNewName';
import FileSource from '../helper/FileSource';


export default function RenderRenaming({
    setIsRenaming, filePath,
}: Readonly<{
    setIsRenaming: (value: boolean) => void,
    filePath: string,
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
    return <AskingNewName defaultName={fileSource.name}
        applyName={handleNameApplying} />;
}
