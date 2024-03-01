import { RequestData } from '../data.js';
import async_fs from 'fs/promises';
import path from 'path';
import escape from 'escape-html';


interface HtmlAssets {
    styles: string[],
	icon?: Uint8Array
}

async function read_assets(assets_path: string): Promise<HtmlAssets> {
    let assets: HtmlAssets = {
        styles: []
    };
    assets.styles.push(
        (await async_fs.readFile(path.join(assets_path, "styles/style.css"), 'utf-8')).one_line()
    );
	const icon_path = path.join(assets_path, "icon/favicon.ico");
	if(await async_fs.access(icon_path)) {
		assets.icon = await async_fs.readFile(icon_path, 'binary');
	}
    return assets;
}

const ASSETS = await read_assets(path.join(process.cwd(), "assets"));



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
		`\t<style>${ASSETS.styles[0]}</style>`,
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
