import { Request, Response } from 'express';
import escape from 'escape-html';


const document_begin = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Template</title>
    <link rel="icon" href="./favicon.ico" type="image/x-icon">
	<style>
	:root {
		--col-primary: #04B329;
		--col-accent: #dedede;
		--col-secondary: #32c2e3;
		--col-secondary-light: #79d8ed;
		--col-secondary-dark: #09b3d9;
		--col-secondary-darker: #0aa0c2;
	}
	
	body {
		margin: 0px;
		padding: 8px;
		/* font-family: sans-serif; */
		font-family: 'Fira Code', monospace;
		font-size: 1rem;
	}
	
	h1 {
		margin: 0px;
		padding: 5px;
		display: block;
		color: #FFFFFF;
		background-color: var(--col-primary);
		font-size: 1.5rem;
	}
	
	h2, h3, p, table, ul, li, button, code[data-block] {
		margin-bottom: 0px;
	}
	
	p, table, ul, button, code[data-block] {
		margin-top: 10px;
	}
	
	p:nth-child(1) {
		margin-top: 0px;
	}
	
	h2 {
		margin-top: 25px;
		font-size: 1.5rem;
	}
	
	h3 {
		margin-top: 20px;
		font-size: 1.2rem;
	}
	
	li {
		margin-top: 4px;
	}
	
	#request-content {
		padding-left: 10px;
		padding-right: 5px;
	}
	
	#request-content > h2, 
	#request-content > h3 {
		padding-left: 10px;
		border-left: 4px solid var(--col-primary);
		/*border-bottom: 1px solid var(--col-accent);*/
		border-radius: 3px;
		text-transform: uppercase;
	}
	
	code {
		font-family: 'Fira Code', monospace;
	}
	
	p code,
	ul code,
	table code,
	code[data-block] {
		display: inline-block;
		background-color: #d4d4d4;
		padding: 2px;
		border-radius: 2px;
	}
	
	code[data-block] {
		display: block;
		white-space: pre-wrap;
		padding: 4px;
		overflow: scroll;
		overflow-wrap: break-word;
		word-break: break-all;
		hyphens: auto;
	}
	
	
	table {
	    border-collapse: collapse;
	}
	
	th, td {
	    border: 2px solid black;
		padding: 5px;
	}
	
	button {
		font-family: 'Fira Code', monospace;
		background-color: var(--col-secondary);
		padding: 6px;
		border: none;
		border-radius: 2px;
	}
	
	button:hover {
		background-color: var(--col-secondary-dark);
	}
	
	button:active {
		background-color: var(--col-secondary-darker);
	}
	
	button:disabled {
		background-color: var(--col-secondary-light);
	}
	
	</style>
  </head>
  <body>
`;

const document_end = `
  </body>
</html>
`;


export function echo_handler(req: Request, res: Response) {

    // console.log(req.socket.remoteAddress)
    // console.log(req.socket.remoteFamily)
    // console.log(req.socket.remotePort)
    // console.log(req.socket.localAddress)
    // console.log(req.socket.localFamily)
    // console.log(req.socket.localPort)

    const host = req.hostname === undefined ? (req.socket.localAddress as string) : req.hostname;
	const protocol = req.secure ? 'HTTPS' : 'HTTP';
	let host_with_port = host;
	if(req.socket.localPort !== (req.secure ? 443 : 80)) {
		host_with_port += `:${req.socket.localPort}`;
	} 
	const uri = `${protocol.toLowerCase()}://${host_with_port}${req.originalUrl}`

    let lines: string[] = [ 
        `\t<h1>Request to ${host}</h1>`,
        '\t<div id="request-content">',
        '\t\t<h2>Request</h2>',
        `\t\t<p>Full URI: <code>${uri}</code></p>`,
        '\t\t<ul>',
        `\t\t\t<li>Method: <code>${req.method}</code></li>`,
        `\t\t\t<li>Protocol: <code>${protocol}</code> (<code>HTTP/${req.httpVersion}</code>)</li>`,
        `\t\t\t<li>Host: <code>${host}</code></li>`,
        `\t\t\t<li>Port: <code>${req.socket.localPort}</code></li>`,
        `\t\t\t<li>Path: <code>${escape(req.path)}</code></li>`,
        '\t\t</ul>'
    ];

	let queries = Object.entries(req.query);
	if(queries.length > 0) {
		lines.push('\t\t<h3>Query parameters</h3>');
		lines.push('\t\t<table>');
		lines.push('\t\t\t<tr>');
		lines.push('\t\t\t\t<th>Parameter</th>');
		lines.push('\t\t\t\t<th>Value(s)</th>');
		lines.push('\t\t\t</tr>');
		for(let [param, value] of queries) {
			if(typeof value === 'string') {
				lines.push('\t\t\t<tr>');
				lines.push(`\t\t\t\t<td><code>${escape(param)}</code></td>`);
				lines.push(`\t\t\t\t<td><code>${escape(value)}</code></td>`);
				lines.push('\t\t\t</tr>');
			} else if(Array.isArray(value) && value.length > 0 && typeof value[0] === 'string') {
				lines.push('\t\t\t<tr>');
				lines.push(`\t\t\t\t<td><code>${escape(param)}</code></td>`);
				lines.push('\t\t\t\t<td>');
				for(let v of (value as string[])) {
					lines.push(`\t\t\t\t\t<p><code>${escape(v)}</code></p>`);
				}
				lines.push('\t\t\t\t</td>');
				lines.push('\t\t\t</tr>');
			}
			// TODO some other edge cases ?
		}
		lines.push('\t\t</table>');
	}

    const headers = Object.entries(req.headersDistinct);
	headers.sort((e1, e2) => e1[0].localeCompare(e2[0]));
	if(headers.length > 0) {
		lines.push('\t\t<h3>Headers</h3>');
		lines.push('\t\t<table>');
		lines.push('\t\t\t<tr>');
		lines.push('\t\t\t\t<th>Header</th>');
		lines.push('\t\t\t\t<th>Value(s)</th>');
		lines.push('\t\t\t</tr>');
		for(let [header, value] of headers) {
			if(value !== undefined) {
				if(value.length > 0) {
					lines.push('\t\t\t<tr>');
					lines.push(`\t\t\t\t<td><code>${escape(header)}</code></td>`);
					lines.push('\t\t\t\t<td>');
					for(let v of value) {
						lines.push(`\t\t\t\t\t<p><code>${escape(v)}</code></p>`);
					}
					lines.push('\t\t\t\t</td>');
					lines.push('\t\t\t</tr>');
				}
			}
		}
		lines.push('\t\t</table>');
	}

// 		<h3>Body</h3>
// 		<code data-block id="body-text">...</code>
    
	lines.push('\t</div>');

    res.type('text/html');
    res.send(document_begin + lines.join('\n') + document_end);
}


