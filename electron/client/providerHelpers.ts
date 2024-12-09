import { htmlFiles, toTitleCase } from '../fsServe';

function freezeObject(obj: any) {
    if (!['object', 'array'].includes(typeof obj)) {
        return;
    }
    Object.freeze(obj);
    if (Array.isArray(obj)) {
        obj.forEach((item) => {
            freezeObject(item);
        });
    } else if (obj instanceof Object) {
        for (const key in obj) {
            freezeObject(obj[key]);
        }
    }
}

export function initProvider(
    extraProvider: { [key: string]: any },
    provider: { [key: string]: any }
) {
    const newProvider = {
        ...provider,
        ...extraProvider,
    };
    for (const [name, htmlFileFullName] of Object.entries(htmlFiles)) {
        newProvider[`${name}HomePage`] = `/${htmlFileFullName}`;
        newProvider[`isPage${toTitleCase(name)}`] = false;
    }
    freezeObject(newProvider);
    (global as any).provider = (window as any).provider = newProvider;
}
