export function checkIsItemInArray(item: any, arr: any): boolean {
    if (!Array.isArray(arr)) {
        return false;
    }
    if (arr.includes(item)) {
        return true;
    }
    for (const arrItem of arr) {
        if (typeof arrItem === 'object' && typeof item === 'object') {
            if (checkAreObjectsEqual(arrItem, item)) {
                return true;
            }
        } else if (arrItem === item) {
            return true;
        }
    }
    return false;
}

export function checkAreArraysEqual(arr1: any, arr2: any) {
    if (!Array.isArray(arr1) || !Array.isArray(arr2)) {
        return false;
    }
    if (arr1 === arr2) {
        return true;
    }
    if (arr1.length !== arr2.length) {
        return false;
    }
    const clonedArr2 = [...arr2];
    for (const item1 of arr1) {
        let found = false;
        for (let i = 0; i < clonedArr2.length; i++) {
            const item2 = clonedArr2[i];
            if (typeof item1 === 'object' && typeof item2 === 'object') {
                if (checkAreObjectsEqual(item1, item2)) {
                    found = true;
                    clonedArr2.splice(i, 1);
                    break;
                }
            } else if (item1 === item2) {
                found = true;
                clonedArr2.splice(i, 1);
                break;
            }
        }
        if (!found) {
            return false;
        }
    }
    if (clonedArr2.length > 0) {
        return false;
    }
    return true;
}

export function checkAreObjectsEqual(obj1: any, obj2: any) {
    if (
        typeof obj1 !== 'object' ||
        typeof obj2 !== 'object' ||
        obj1 === null ||
        obj2 === null
    ) {
        return false;
    }
    if (obj1 === obj2) {
        return true;
    }
    if (Object.keys(obj1).length !== Object.keys(obj2).length) {
        return false;
    }

    for (const key in obj1) {
        const value1 = obj1[key];
        const value2 = obj2[key];
        if (typeof value1 === 'object' && typeof value2 === 'object') {
            if (!checkAreObjectsEqual(value1, value2)) {
                return false;
            }
        } else if (Array.isArray(value1) && Array.isArray(value2)) {
            if (!checkAreArraysEqual(value1, value2)) {
                return false;
            }
        } else if (value1 !== value2) {
            return false;
        }
    }
    return true;
}
