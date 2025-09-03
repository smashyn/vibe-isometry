export function getQueryParam(name: string): string | null {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

export function removeQueryParam(name: string) {
    const url = new URL(window.location.href);
    url.searchParams.delete(name);
    window.history.replaceState({}, document.title, url.pathname + url.search);
}
