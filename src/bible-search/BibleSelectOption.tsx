import {
    useGetBibleWithStatus,
} from '../server/bible-helpers/bibleHelpers';

export default function BibleSelectOption({ bibleName }: {
    bibleName: string,
}) {
    const bibleStatus = useGetBibleWithStatus(bibleName);
    if (bibleStatus === null) {
        return null;
    }
    const [bible1, isAvailable, bibleName1] = bibleStatus;
    return (
        <option disabled={!isAvailable}
            value={bible1}>{bibleName1}</option>
    );
}
