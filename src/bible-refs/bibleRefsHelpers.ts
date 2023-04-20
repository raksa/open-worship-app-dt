import {
    get_api_url,
    get_api_key,
    decrypt,
} from '../_owa-crypto';
import {
    handleError,
} from '../helper/errorHelpers';

async function downloadBibleRef(key: string) {
    try {
        const apiUrl = get_api_url();
        const apiKey = get_api_key();
        const content = await fetch(`${apiUrl}/bible-refs/${key}`, {
            headers: {
                'x-api-key': apiKey,
            },
        });
        return await content.text();
    } catch (error) {
        handleError(error);
    }
    return null;
}

export async function getBibleRef(key: string) {
    const encryptedText = await downloadBibleRef(key);
    if (encryptedText === null) {
        return null;
    }
    const text = decrypt(encryptedText);
    try {
        return JSON.parse(text);
    } catch (error) {
        handleError(error);
    }
    return text;
}