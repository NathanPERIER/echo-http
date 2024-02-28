import { RequestData } from './data.js';
import { Request, Response } from 'express';
import escape from 'escape-html';



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


export function handle_html(req: RequestData): {lines: string[], content_type: string} {

	const protocol = req.secure ? 'HTTPS' : 'HTTP';
	let host_with_port = req.host;
	if(req.server.port !== (req.secure ? 443 : 80)) {
		host_with_port += `:${req.server.port}`;
	} 
	const uri = `${protocol.toLowerCase()}://${host_with_port}${req.original_url}`

    let lines: string[] = [
		'<!DOCTYPE html>',
		'<html lang="en">',
		'<head>',
		'\t<meta charset="UTF-8">',
		'\t<title>Echo HTTP</title>',
		'\t<link rel="icon" href="./favicon.ico" type="image/x-icon">',
		'\t<style> /* TODO */ </style>',
		'</head>',
		'<body>',
        `\t<h1>Request to ${req.host}</h1>`,
        '\t<div id="request-content">',
        '\t\t<h2>Request</h2>',
        `\t\t<p>Full URI: <code>${uri}</code></p>`,
        '\t\t<ul>',
        `\t\t\t<li>Method: <code>${req.method}</code></li>`,
        `\t\t\t<li>Protocol: <code>${protocol}</code> (<code>HTTP/${req.http_version}</code>)</li>`,
        `\t\t\t<li>Host: <code>${req.host}</code></li>`,
        `\t\t\t<li>Port: <code>${req.server.port}</code></li>`,
        `\t\t\t<li>Path: <code>${escape(req.path)}</code></li>`,
        '\t\t</ul>'
    ];

	
	if(req.queries.size > 0) {
		lines.push('\t\t<h3>Query parameters</h3>');
		lines.push('\t\t<table>');
		lines.push('\t\t\t<tr>');
		lines.push('\t\t\t\t<th>Parameter</th>');
		lines.push('\t\t\t\t<th>Value(s)</th>');
		lines.push('\t\t\t</tr>');
		for(let [param, values] of req.queries.entries()) {
			lines.push('\t\t\t<tr>');
			lines.push(`\t\t\t\t<td><code>${escape(param)}</code></td>`);
			lines.push('\t\t\t\t<td>');
			for(let v of values) {
				lines.push(`\t\t\t\t\t<p><code>${escape(v)}</code></p>`);
			}
			lines.push('\t\t\t\t</td>');
			lines.push('\t\t\t</tr>');
		}
		lines.push('\t\t</table>');
	}

	if(req.headers.size > 0) {
		lines.push('\t\t<h3>Headers</h3>');
		lines.push('\t\t<table>');
		lines.push('\t\t\t<tr>');
		lines.push('\t\t\t\t<th>Header</th>');
		lines.push('\t\t\t\t<th>Value(s)</th>');
		lines.push('\t\t\t</tr>');
		for(let [header, values] of [...req.headers.entries()].sort((e1, e2) => e1[0].localeCompare(e2[0]))) {
			lines.push('\t\t\t<tr>');
			lines.push(`\t\t\t\t<td><code>${escape(header)}</code></td>`);
			lines.push('\t\t\t\t<td>');
			for(let v of values) {
				lines.push(`\t\t\t\t\t<p><code>${escape(v)}</code></p>`);
			}
			lines.push('\t\t\t\t</td>');
			lines.push('\t\t\t</tr>');
		}
		lines.push('\t\t</table>');
	}

// 		<h3>Body</h3>
// 		<code data-block id="body-text">...</code>
    
	lines.push('\t</div>');
	lines.push('\t</body>');
	lines.push('</html>');

	return { lines: lines, content_type: 'text/html' };
}


