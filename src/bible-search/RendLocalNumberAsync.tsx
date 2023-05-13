import { useToLocaleNumBB } from '../server/bible-helpers/serverBibleHelpers2';

export default function RendLocalNumberAsync({
    bibleSelected, ind,
}: {
    bibleSelected: string, ind: number,
}) {
    const str = useToLocaleNumBB(bibleSelected, ind);
    return (
        <span>{str || ''}</span>
    );
}
