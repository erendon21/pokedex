export interface HttpAdapter {
    get<T>(url: string): Promise<T>; // For generic types use T
}