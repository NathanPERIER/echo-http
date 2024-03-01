import { RequestData } from '../data.js';


function replacer(this: any, _key: string, value: any): any {
    if(value instanceof Map) {
        return Array.from(value.entries());
    }
    return value;
}


export function handle_json(req: RequestData): {lines: string[], content_type: string} {

    const line = JSON.stringify(req, replacer, undefined);
    
	return { lines: [line], content_type: 'text/html' };
}
