import { useCallback } from 'react';
import AskingNewName from './AskingNewName';
import FileSource from '../helper/FileSource';


export default function RenderRenaming({
    setIsRenaming, filePath,
}: {
    setIsRenaming: (value: boolean) => void,
    filePath: string,
}) {
    const applyNameCallback = useCallback(async (name: string | null) => {
        if (name === null) {
            setIsRenaming(false);
            return;
        }
        const fileSource = FileSource.getInstance(filePath);
        const isSuccess = await fileSource.renameTo(name);
        setIsRenaming(!isSuccess);
    }, [setIsRenaming, filePath]);
    const fileSource = FileSource.getInstance(filePath);
    return <AskingNewName defaultName={fileSource.name}
        applyName={applyNameCallback} />;
}
