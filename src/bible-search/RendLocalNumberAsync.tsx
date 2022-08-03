import { useToLocaleNumber } from '../server/bible-helpers/helpers2';

export default function RendLocalNumberAsync({ bibleSelected, ind }: {
    bibleSelected: string, ind: number,
}) {
    const str = useToLocaleNumber(bibleSelected, ind);
    return (
        <span>{str || ''}</span>
    );
}
