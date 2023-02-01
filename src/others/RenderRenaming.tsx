import { useCallback } from 'react';
import FileSource from '../helper/FileSource';
import AskingNewName from './AskingNewName';


export default function RenderRenaming({
    setIsRenaming, fileSource,
}: {
    setIsRenaming: (value: boolean) => void,
    fileSource: FileSource,
}) {
    const applyNameCallback = useCallback(async (name: string | null) => {
        if (name === null) {
            setIsRenaming(false);
            return;
        }
        const isSuccess = await fileSource.renameTo(name);
        setIsRenaming(!isSuccess);
    }, [setIsRenaming, fileSource]);
    return <AskingNewName defaultName={fileSource.name}
        applyName={applyNameCallback} />;
}
