import {
    calcPaging, BibleSearchOnlineType, pageNumberToReqData,
} from './bibleOnlineHelpers';
import BibleOnlineRenderPerPage from './BibleOnlineRenderPerPage';

export default function BibleOnlineRenderData({
    text, allData, searchFor,
}: Readonly<{
    text: string,
    allData: { [key: string]: BibleSearchOnlineType },
    searchFor: (from: number, to: number) => void,
}>) {
    const allPageNumberFound = Object.keys(allData);
    if (allPageNumberFound.length === 0) {
        return (
            <div>No Data</div>
        );
    }
    const pagingData = calcPaging(allData[allPageNumberFound[0]]);
    const searchFor1 = (pageNumber: string) => {
        const searchForData = pageNumberToReqData(pagingData, pageNumber);
        searchFor(searchForData.fromLineNumber, searchForData.toLineNumber);
    };
    const { pages } = pagingData;
    return (
        <>
            <div className='card-body w-100'>
                <h4>{text}</h4>
                {allPageNumberFound.map((pageNumber) => {
                    if (!pages.includes(pageNumber)) {
                        return null;
                    }
                    const data = allData[pageNumber];
                    return (
                        <BibleOnlineRenderPerPage key={pageNumber}
                            text={text}
                            data={data} pageNumber={pageNumber}
                        />
                    );
                })}
            </div>
            <div className='card-footer'>
                <nav>
                    <ul className='pagination flex-wrap'>
                        {pages.map((pageNumber) => {
                            const isActive = allPageNumberFound.includes(
                                pageNumber,
                            );
                            return (
                                <li key={pageNumber}
                                    className={
                                        `page-item ${isActive ? 'active' : ''}`
                                    }>
                                    <button className='page-link'
                                        disabled={isActive}
                                        onClick={() => {
                                            searchFor1(pageNumber);
                                        }}>
                                        {pageNumber}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </div>
        </>
    );
}
