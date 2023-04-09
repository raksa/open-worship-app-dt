import { KeyboardType } from '../event/KeyboardEventListener';

function indexing(listLength: number, index: number, isNext: boolean) {
    return ((index + (isNext ? 1 : -1)) + listLength) %
        listLength;
}
function calculateIndexer(optionClass: string) {
    const cordList = Array.from(document.getElementsByClassName(optionClass))
        .map((element: any) => {
            const cRect = (element as HTMLDivElement).getBoundingClientRect();
            return {
                x: cRect.x,
                y: cRect.y,
            };
        });
    const indexer = [];
    let row: null[] = [];
    let preY = -1;
    cordList.forEach((cord) => {
        if (cord.y !== preY) {
            preY = cord.y;
            if (row.length) {
                indexer.push(row);
            }
            row = [];
        }
        row.push(null);
    });
    if (row.length) {
        indexer.push(row);
    }
    const rotatedIndexer = [];
    for (let i = 0; i < indexer[0].length; i++) {
        const row = [];
        for (const element of indexer) {
            row.push(element[i]);
        }
        rotatedIndexer.push(row.filter((e) => {
            return e === null;
        }));
    }
    return { indexer, rotatedIndexer };
}
function indexToCord(hLength: number, index: number) {
    const x = index % hLength;
    const y = Math.floor(index / hLength);
    return { x, y };
}
function cordToIndex(hLength: number, x: number, y: number) {
    return x + y * hLength;
}
export function genInd(preIndex: number, total: number,
    key: KeyboardType, offset: number, optionClass: string) {
    const { indexer, rotatedIndexer } = calculateIndexer(optionClass);
    if (!indexer.length) {
        return preIndex;
    }
    const hLength = indexer[0].length;
    let { x, y } = indexToCord(hLength, preIndex);
    const horizontalLength = indexer[y].length;
    const verticalLength = rotatedIndexer[x].length;
    if (key === 'ArrowLeft') {
        x = indexing(horizontalLength, x, false);
    } else if (key === 'ArrowRight') {
        x = indexing(horizontalLength, x, true);
    } else if (key === 'ArrowUp') {
        y = indexing(verticalLength, y, false);
    } else if (key === 'ArrowDown') {
        y = indexing(verticalLength, y, true);
    }
    return cordToIndex(hLength, x, y);
}
