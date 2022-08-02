import { KeyboardType } from '../event/KeyboardEventListener';

function genLeft(index: number, total: number, offset: number) {
    const preOffset = offset - 1;
    const mod = index % offset;
    if (mod === 0) {
        index = index + preOffset;
        if (index >= total) {
            index = total - 1;
        }
    } else {
        index = index - 1;
    }
    return index;
}
function genRight(index: number, total: number, offset: number) {
    const preOffset = offset - 1;
    const mod = index % offset;
    if (mod === preOffset) {
        index = index - preOffset;
    } else {
        index = index + 1;
        if (index >= total) {
            const rowCount = Math.floor(index / offset);
            index = rowCount * offset;
        }
    }
    return index;
}
function genUp(index: number, total: number, offset: number) {
    if (index - offset < 0) {
        const rowCount = Math.floor(total / offset);
        index = rowCount * offset + index;
        if (index >= total) {
            index -= offset;
        }
    } else {
        index = index - offset;
    }
    return index;
}
function genDown(index: number, total: number, offset: number) {
    if (index + offset >= total) {
        const rowCount = Math.floor(index / offset);
        index = index - rowCount * offset;
    } else {
        index = index + offset;
    }
    return index;
}
export function genInd(index: number, total: number,
    key: KeyboardType, offset: number) {
    if (key === 'ArrowLeft') {
        return genLeft(index, total, offset);
    } else if (key === 'ArrowRight') {
        return genRight(index, total, offset);
    } else if (key === 'ArrowUp') {
        return genUp(index, total, offset);
    } else if (key === 'ArrowDown') {
        return genDown(index, total, offset);
    }
    return index;
}
