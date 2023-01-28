import ToastEventListener from '../../event/ToastEventListener';
import {
    toBiblePath,
} from '../../server/bible-helpers/bibleInfoHelpers';
import {
    fsCheckDirExist,
    fsDeleteDir,
} from '../../server/fileHelper';
import {
    BibleMinimalInfoType,
} from '../../server/bible-helpers/bibleDownloadHelpers';

export default function DownloadedBibleItem({
    bibleInfo,
    onDeleted,
    onUpdate,
}: {
    bibleInfo: BibleMinimalInfoType & { isUpdatable: boolean },
    onDeleted: () => void,
    onUpdate: () => void,
}) {
    const { key, title } = bibleInfo;
    const onDeleteHandler = async () => {
        try {
            const bibleDestination = await toBiblePath(key);
            if (bibleDestination !== null &&
                await fsCheckDirExist(bibleDestination)) {
                await fsDeleteDir(bibleDestination);
            }
            onDeleted();
        } catch (error: any) {
            ToastEventListener.showSimpleToast({
                title: 'Deleting',
                message: error.message,
            });
        }
    };
    return (
        <li className='list-group-item'>
            <div>
                <span>{title} ({key})</span>
                <div className='float-end'>
                    <div className='btn-group'>
                        <button className='btn btn-danger'
                            onClick={onDeleteHandler}>
                            Delete
                        </button>
                        {bibleInfo.isUpdatable && (<button
                            className='btn btn-warning'
                            onClick={() => {
                                onUpdate();
                            }}>
                            Update
                        </button>)
                        }
                    </div>
                </div>
            </div>
        </li>
    );
}
