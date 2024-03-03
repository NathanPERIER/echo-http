import { RequestData } from './data.js';
import { format_response } from './formatters/formats.js';
import { is_content_printable } from '../utils/content_types.js';
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
		headers: new Map<string, string[]>(),
		body: null
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

	if(req.body instanceof Buffer && req.body.length > 0) {
		const content_type = data.headers.get('content-type');
		if(content_type !== undefined && is_content_printable(content_type[0])) {
			data.body = req.body.toString('utf8');
		} else {
			data.body = req.body;
		}
	}

	const rsp = format_response(data);

	res.type(rsp.content_type);
	res.send(rsp.lines.join('\n'));
}

