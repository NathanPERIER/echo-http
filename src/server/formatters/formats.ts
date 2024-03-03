
import { RequestData } from '../data.js';
import { handle_html } from './html_format.js';
import { handle_json } from './json_format.js';
import { handle_text } from './text_format.js';


enum EchoFormat {
	HTML,
	JSON,
	TEXT
}

const formatters = new Map([
	[EchoFormat.HTML, handle_html],
	[EchoFormat.JSON, handle_json],
	[EchoFormat.TEXT, handle_text]
])


function determine_format(req: RequestData): EchoFormat {
	if(req.headers.has('echo-format')) {
		const format_repr = req.headers.get('echo-format')![0].toLowerCase();
		switch(format_repr) {
			case 'html': return EchoFormat.HTML;
			case 'json': return EchoFormat.JSON;
			case 'text': return EchoFormat.TEXT;
		}
		// TODO error
	}
	if(req.path.endsWith('.html')) {
		return EchoFormat.HTML;
	}
	if(req.path.endsWith('.json')) {
		return EchoFormat.JSON;
	}
	if(req.path.endsWith('.txt')) {
		return EchoFormat.TEXT;
	}
	if(req.headers.has('accept')) {
		const accept_header = req.headers.get('accept')![0];
		if(accept_header.includes('text/html')) {
			return EchoFormat.HTML;
		}
		if(accept_header.includes('application/json')) {
			return EchoFormat.JSON;
		}
		if(accept_header.includes('text/plain')) {
			return EchoFormat.TEXT;
		}
	}
	return EchoFormat.TEXT;
}


export function format_response(req: RequestData): {lines: string[], content_type: string} {
    const format = determine_format(req);
	const format_data = formatters.get(format)!;

	return format_data(req);
}
