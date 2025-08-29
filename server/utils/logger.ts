type LogLevel = 'info' | 'warning' | 'error' | 'debug';

function log(level: LogLevel, ...args: any[]) {
    const prefix = `[${level.toUpperCase()}]`;
    const time = new Date().toISOString();
    if (level === 'error') {
        console.error(time, prefix, ...args);
    } else if (level === 'warning') {
        console.warn(time, prefix, ...args);
    } else if (level === 'debug') {
        if (process.env.DEBUG) console.debug(time, prefix, ...args);
    } else {
        console.log(time, prefix, ...args);
    }
}

export const logger = {
    info: (...args: any[]) => log('info', ...args),
    warning: (...args: any[]) => log('warning', ...args),
    error: (...args: any[]) => log('error', ...args),
    debug: (...args: any[]) => log('debug', ...args),
};
