import {
    useGetBibleWithStatus,
} from '../helper/bible-helpers/serverBibleHelpers';

export default function BibleSelectOption({ bibleKey }: Readonly<{
    bibleKey: string,
}>) {
    const bibleStatus = useGetBibleWithStatus(bibleKey);
    if (bibleStatus === null) {
        return (
            <option disabled value={bibleKey}>
                {bibleKey}
            </option>
        );
    }
    const [bible1, isAvailable, bibleKey1] = bibleStatus;
    return (
        <option disabled={!isAvailable}
            value={bible1}>
            {bibleKey1}
        </option>
    );
}
