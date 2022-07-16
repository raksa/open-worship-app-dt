import { useEffect, useState } from 'react';
import Lyric from '../lyric-list/Lyric';

export default function SavingRenderer({ lyric }: { lyric: Lyric }) {
    const [isEditing, setIEditing] = useState(false);
    useEffect(() => {
        Lyric.readFileToDataNoCache(lyric.fileSource).then((lr) => {
            if (lr && JSON.stringify(lyric.content) !== JSON.stringify(lr?.content)) {
                setIEditing(true);
            } else {
                setIEditing(false);
            }
        });
    }, [lyric]);
    if (!isEditing) {
        return null;
    }
    return (
        <button className='btn btn-success' title='Save'
            onClick={async () => {
                if (await lyric.save()) {
                    setIEditing(false);
                }
            }}
            style={{
                width: '20px',
                padding: '0px',
            }}><i className='bi bi-save' />
        </button>
    );
}
