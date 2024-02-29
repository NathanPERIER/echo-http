import { RequestData } from './data.js';
import { handle_html } from './handlers/html_handler.js';
import { Request, Response } from 'express';


enum EchoFormat {
	HTML,
	JSON,
	TEXT
}


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


export function echo_handler(req: Request, res: Response) {
	let data: RequestData = {
		client: {
			address: req.socket.remoteAddress!,
			ip_family: req.socket.remoteFamily!,
			port: req.socket.remotePort!
		},
		server: {
			address: req.socket.localAddress!,
			ip_family: req.socket.localFamily!,
			port: req.socket.localPort!
		},
		secure: req.secure,
		http_version: req.httpVersion,
		method: req.method,
		host: req.hostname === undefined ? (req.socket.localAddress as string) : req.hostname,
		original_url: req.originalUrl,
		path: req.path,
		queries: new Map<string, string[]>(),
		headers: new Map<string, string[]>()
	};

	const queries = Object.entries(req.query);
	if(queries.length > 0) {
		for(let [param, value] of queries) {
			if(typeof value === 'string') {
				data.queries.set(param, [value]);
			} else if(Array.isArray(value) && value.length > 0 && typeof value[0] === 'string') {
				data.queries.set(param, value as string[]);
			}
			// TODO some other edge cases ?
		}
	}

	const headers = Object.entries(req.headersDistinct);
	if(headers.length > 0) {
		for(let [header, value] of headers) {
			if(value === undefined || value.length === 0) {
				continue;
			}
			data.headers.set(header, value);
		}
	}

	const rsp = handle_html(data);

	res.type(rsp.content_type);
	res.send(rsp.lines.join('\n'));
}

