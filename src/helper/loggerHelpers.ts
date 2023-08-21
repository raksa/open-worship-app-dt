const logLevelMapper = {
    'verbose': ['error', 'warn', 'log', 'trace'],
    'minimal': ['error', 'warn'],
    'critical': ['error'],
};
const logLevel: 'verbose' | 'minimal' | 'critical' = 'critical';
const logLevelList = logLevelMapper[logLevel];

function callConsole(method: string, ...args: any[]) {
    if (!logLevelList.includes(method)) {
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
