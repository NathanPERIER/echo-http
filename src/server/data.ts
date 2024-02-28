
export interface RequestData {
    client: {
        address: string,
        ip_family: string,
        port: number
    },
    server: {
        address: string,
        ip_family: string,
        port: number
    },
    secure: boolean,
    http_version: string,
    method: string,
    host: string,
    original_url: string,
    path: string,
    queries: Map<string, string[]>,
    headers: Map<string, string[]>
}
