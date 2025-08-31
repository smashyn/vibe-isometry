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
    const response = await fetch(url, fetchOptions);
    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }
    return response.json();
}
