import {
    BibleMinimalInfoType,
} from '../../helper/bible-helpers/bibleDownloadHelpers';
import { useDownloadBible } from './bibleDownloadingHelpers';

export default function OnlineBibleItemComp({
    bibleInfo, onDownloaded,
}: Readonly<{
    bibleInfo: BibleMinimalInfoType,
    onDownloaded: () => void,
}>) {
    const [downloadingProgress, startDownloadBible] = useDownloadBible(
        bibleInfo, onDownloaded,
    );
    return (
        <li className='list-group-item'>
            <div className='w-100'>
                <span>{bibleInfo.title} ({bibleInfo.key})</span>
                {downloadingProgress === null ? (
                    <div className='float-end'>
                        <button className='btn btn-info'
                            onClick={startDownloadBible}>
                            Download <i className='bi bi-cloud-arrow-down' />
                        </button>
                    </div>
                ) : (
                    <div>
                        <div className='progress'>
                            <div className={
                                'progress-bar progress-bar-striped ' +
                                'progress-bar-animated'
                            }
                                role='progressbar'
                                aria-valuenow={downloadingProgress * 100}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                style={{
                                    width: `${downloadingProgress * 100}%`,
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </li>
    );
}
