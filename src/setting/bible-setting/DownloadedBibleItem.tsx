import {
    bibleDataReader,
} from '../../helper/bible-helpers/bibleInfoHelpers';
import {
    fsCheckDirExist, fsDeleteDir,
} from '../../server/fileHelper';
import {
    BibleMinimalInfoType,
} from '../../helper/bible-helpers/bibleDownloadHelpers';
import { showSimpleToast } from '../../toast/toastHelpers';
import {
    hideProgressBard, showProgressBard,
} from '../../progress-bar/progressBarHelpers';

export default function DownloadedBibleItem({
    bibleInfo, onDeleted, onUpdate,
}: Readonly<{
    bibleInfo: BibleMinimalInfoType & { isUpdatable: boolean },
    onDeleted: () => void,
    onUpdate: () => void,
}>) {
    const { key, title } = bibleInfo;
    const onDeleteHandler = async () => {
        try {
            const progressKey = `Deleting bible "${title}"`;
            showProgressBard(progressKey);
            const bibleDestination = await bibleDataReader.toBiblePath(key);
            if (
                bibleDestination !== null &&
                await fsCheckDirExist(bibleDestination)
            ) {
                await fsDeleteDir(bibleDestination);
                await bibleDataReader.clearBibleDBData(key);
            }
            hideProgressBard(progressKey);
            onDeleted();
        } catch (error: any) {
            showSimpleToast('Deleting', error.message);
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
