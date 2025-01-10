import {
    KeyboardType,
    useKeyboardRegistering,
} from '../event/KeyboardEventListener';

export const INPUT_TEXT_CLASS = 'bible-search-input-text';

function indexing(listLength: number, index: number, isNext: boolean) {
    return (index + (isNext ? 1 : -1) + listLength) % listLength;
}

function getElements(optionClass: string) {
    return Array.from(
        document.querySelectorAll<HTMLDivElement>(`.${optionClass}`),
    );
}

function calculateIndexer(optionClass: string, selectedClass: string) {
    const elements = getElements(optionClass);
    if (!elements.length) {
        return { elements, indexer: [], rotatedIndexer: [], preIndex: -1 };
    }
    const preIndex = elements.findIndex((element) => {
        return element.classList.contains(selectedClass);
    });
    const cordList = elements.map((element: any) => {
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
        rotatedIndexer.push(
            row.filter((e) => {
                return e === null;
            }),
        );
    }
    return { elements, indexer, rotatedIndexer, preIndex };
}

function indexToCord(hLength: number, index: number) {
    const x = index % hLength;
    const y = Math.floor(index / hLength);
    return { x, y };
}

function cordToIndex(hLength: number, x: number, y: number) {
    return x + y * hLength;
}

function genIndex(
    optionClass: string,
    selectedClass: string,
    key: KeyboardType,
) {
    const { elements, indexer, rotatedIndexer, preIndex } = calculateIndexer(
        optionClass,
        selectedClass,
    );
    if (!indexer.length) {
        return { index: -1, elements: [] };
    }
    if (preIndex === -1) {
        return { index: 0, elements };
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
    return { index: cordToIndex(hLength, x, y), elements };
}

export function getSelectedElement(optionClass: string, selectedClass: string) {
    const elements = getElements(optionClass);
    return elements.find((element) => {
        return element.classList.contains(selectedClass);
    });
}

function blurInputText() {
    const inputText = document.querySelector<HTMLInputElement>(
        `.${INPUT_TEXT_CLASS}`,
    );
    if (inputText) {
        inputText.blur();
    }
}

export function processSelection(
    optionClass: string,
    selectedClass: string,
    key: KeyboardType,
) {
    if (
        (key === 'ArrowLeft' || key === 'ArrowRight') &&
        checkIsBibleSearchInputFocused() &&
        getBibleSearchInputText() !== ''
    ) {
        return;
    }
    const { index, elements } = genIndex(optionClass, selectedClass, key);
    if (index === -1) {
        return;
    }
    elements.forEach((element) => {
        element.classList.remove(selectedClass);
    });
    elements[index].classList.add(selectedClass);
    blurInputText();
    elements[index].scrollIntoView({
        block: 'end',
        behavior: 'smooth',
    });
}

export type SelectBookType = (newBookKey: string, newBook: string) => void;

export function userEnteringSelected(
    optionClass: string,
    selectedClass: string,
) {
    useKeyboardRegistering([{ key: 'Enter' }], () => {
        const selectedElement = getSelectedElement(optionClass, selectedClass);
        selectedElement?.click();
    });
}

export const BIBLE_SEARCH_INPUT_ID = 'app-bible-search-input';

export function getBibleSearchInputElement(): HTMLInputElement | null {
    return document.getElementById(BIBLE_SEARCH_INPUT_ID) as HTMLInputElement;
}
export function getBibleSearchInputText() {
    const inputElement = getBibleSearchInputElement();
    if (inputElement === null) {
        return '';
    }
    return inputElement.value;
}
export function checkIsBibleSearchInputFocused(): boolean {
    const inputElement = getBibleSearchInputElement();
    if (inputElement === null) {
        return false;
    }
    return document.activeElement === inputElement;
}
export function setBibleSearchInputFocus() {
    const inputElement = getBibleSearchInputElement();
    if (inputElement === null) {
        return;
    }
    inputElement.focus();
}
