import { RequestData } from '../data.js';


function replacer(this: any, _key: string, value: any): any {
    if(value instanceof Map) {
        return Object.fromEntries(value.entries());
    }
    return value;
}


export function handle_json(req: RequestData): {lines: string[], content_type: string} {

    // TODO body
    const line = JSON.stringify(req, replacer, undefined);
    
	return { lines: [line], content_type: 'application/json' };
}
