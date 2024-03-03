

export function is_content_printable(content_type: string): boolean {
    if(content_type.startsWith('text/')) {
        return true;
    }
    if([
        'application/json',
        'application/xhtml+xml',
        'application/xml',
        'application/x-httpd-php',
        'application/x-www-form-urlencoded'
    ].includes(content_type)) {
        return true;
    }
    return false;
}
