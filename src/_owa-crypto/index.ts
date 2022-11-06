
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

export function get_api_key(str: string): string {
    return 'InJesusChrist';
}

export function version() {
    return '0.0.0';
}

export function is_dev() {
    return true;
}
