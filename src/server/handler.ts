import { RequestData } from './data.js';
import { handle_html } from './handlers/html_handler.js';
import { Request, Response } from 'express';


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

