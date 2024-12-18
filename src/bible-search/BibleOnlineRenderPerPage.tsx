import {
    SearchBibleItemViewController,
} from '../bible-reader/BibleItemViewController';
import { BibleSearchOnlineType, breakItem } from './bibleOnlineHelpers';

export default function BibleOnlineRenderPerPage({
    pageNumber, data, text, bibleKey,
}: Readonly<{
    pageNumber: string,
    data: BibleSearchOnlineType,
    text: string,
    bibleKey: string,
}>) {
    return (
        <>
            <div className='d-flex'>
                <span>{pageNumber}</span><hr className='w-100' />
            </div>
            <div className='w-100'>
                {data.content.map((item) => {
                    const {
                        newItem, kjvTitle, bibleItem,
                    } = breakItem(text, item, bibleKey);
                    return (
                        <button
                            className={
                                'btn btn-sm btn-outline-info ' +
                                'app-ellipsis w-100 overflow-hidden-x'
                            }
                            onClick={() => {
                                SearchBibleItemViewController.getInstance().
                                    appendBibleItem(bibleItem);
                            }}
                            title={item}
                            style={{ textAlign: 'left' }}
                            key={item.substring(10)}>
                            <span>{kjvTitle}</span> ... <span
                                dangerouslySetInnerHTML={{
                                    __html: newItem,
                                }} />
                        </button>
                    );
                })}
            </div>
        </>
    );
}
