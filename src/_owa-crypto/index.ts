export default function init() {
    return Promise.resolve();
}

export function encrypt(message: string): string {
    return message;
}

export function decrypt(message: string): string {
    return message;
}

export function get_api_url(): string {
    return 'https://bibles-development.openworship.app';
}

export function get_api_key(): string {
    return 'InJesusChrist';
}

export function version() {
    return '0.0.0';
}

export function is_dev() {
    return true;
}

export function bible_ref(text: string) {
    // isS "S GEN 1:5"
    // isFN "FN GEN 1:5"
    // isStar "STAR GEN 1:5"
    // isTitle "TITLE GEN 1:5"
    // isLXXDSS "LXXDSS GEN 1:5"
    // TODO: implement this extraction
    return JSON.stringify({
        text,
        isS: false,
        isFN: false,
        isStar: false,
        isTitle: false,
        isLXXDSS: false,
    });
}
