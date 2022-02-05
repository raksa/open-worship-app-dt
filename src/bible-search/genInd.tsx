import { KeyEnum } from '../event/KeyboardEventListener';

export function genInd(index: number, total: number, key: KeyEnum, offset: number) {
    const preOffset = offset - 1;
    const mod = index % offset;
    let ind = index;
    if (key === KeyEnum.ArrowUp) {
        if (index - offset < 0) {
            const rowCount = Math.floor(total / offset);
            ind = rowCount * offset + index;
            if (ind >= total) {
                ind -= offset;
            }
        } else {
            ind = index - offset;
        }
    } else if (key === KeyEnum.ArrowRight) {
        if (mod === preOffset) {
            ind = index - preOffset;
        } else {
            ind = index + 1;
            if (ind >= total) {
                const rowCount = Math.floor(index / offset);
                ind = rowCount * offset;
            }
        }
    } else if (key === KeyEnum.ArrowDown) {
        if (index + offset >= total) {
            const rowCount = Math.floor(index / offset);
            ind = index - rowCount * offset;
        } else {
            ind = index + offset;
        }
    } else if (key === KeyEnum.ArrowLeft) {
        if (mod === 0) {
            ind = index + preOffset;
            if (ind >= total) {
                ind = total - 1;
            }
        } else {
            ind = index - 1;
        }
    }
    return ind;
}
