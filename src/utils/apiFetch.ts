import { apiBasePath } from '../config/apiConfig';

function joinApiUrl(base: string, url: string): string {
    if (!base.endsWith('/') && !url.startsWith('/')) {
        return base + '/' + url;
    }
    if (base.endsWith('/') && url.startsWith('/')) {
        return base + url.slice(1);
    }
    return base + url;
}

export async function apiFetch<T = any>(
    url: string,
    options?: RequestInit,
    data?: any,
): Promise<T> {
    const fetchOptions: RequestInit = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(options?.headers || {}),
        },
        body: data !== undefined ? JSON.stringify(data) : options?.body,
    };
    const fullUrl = joinApiUrl(apiBasePath, url);
    const response = await fetch(fullUrl, fetchOptions);
    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }
    return response.json();
}
