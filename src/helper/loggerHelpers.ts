const isSilent = false;

function callConsole(method: string, ...args: any[]) {
    if (isSilent) {
        return;
    }
    const callable = (console as any)[method] as Function | undefined;
    callable?.call(console, ...args);
}

export function log(...args: any[]) {
    callConsole('log', ...args);
}

export function error(...args: any[]) {
    callConsole('error', ...args);
}

export function warn(...args: any[]) {
    callConsole('warn', ...args);
}

export function trace(...args: any[]) {
    callConsole('trace', ...args);
}
