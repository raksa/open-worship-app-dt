export function setSetting(key: string, value: string) {
    window.localStorage.setItem(key, value);
}
export function getSetting(key: string, defaultValue?: string): string {
    const value = window.localStorage.getItem(key);
    if (value === null) {
        if (defaultValue !== undefined) {
            return defaultValue;
        }
        return '';
    }
    return value;
}
