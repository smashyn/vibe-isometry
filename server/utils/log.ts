let ENABLE_LOGS = true;

export function setLogEnabled(enabled: boolean) {
    ENABLE_LOGS = enabled;
}

export function log(...args: any[]) {
    if (ENABLE_LOGS) {
        console.log(...args);
    }
}

export function isLogEnabled() {
    return ENABLE_LOGS;
}
