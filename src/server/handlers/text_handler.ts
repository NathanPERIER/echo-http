import { RequestData } from '../data.js';
import { hexdump } from '../../utils/binary.js';


function draw_table(titles: [string, string], cols: Map<string, string[]>): string[] {
    let res: string[] = [];
    let max_len: [number, number] = [
        Math.max(titles[0].length, ...cols.map((k, _v) => k.length)),
        Math.max(titles[1].length, ...cols.map((_k, v) => Math.max(...v.map((l) => l.length)))),
    ];
    const sep = "+-" + '-'.repeat(max_len[0]) + "-+-" + '-'.repeat(max_len[1]) + "-+";
    res.push(sep);
    res.push("| " + titles[0].centre(max_len[0]) + " | " + titles[1].centre(max_len[1]) + " |");
    res.push(sep);
    cols.forEach((values, key) => {
        res.push("| " + key.ljust(max_len[0]) + " | " + values[0].ljust(max_len[1]) + " |");
        for(let i = 1; i < values.length; i++) {
            res.push("| " + ' '.repeat(max_len[0]) + " | " + values[i].ljust(max_len[1]) + " |");
        }
    })
    res.push(sep);
    return res;
}


export function handle_text(req: RequestData): {lines: string[], content_type: string} {

	const protocol = req.secure ? 'HTTPS' : 'HTTP';
	let host_with_port = req.host;
	if(req.server.port !== (req.secure ? 443 : 80)) {
		host_with_port += `:${req.server.port}`;
	} 
	const uri = `${protocol.toLowerCase()}://${host_with_port}${req.original_url}`

    let lines: string[] = [
        `# Echo HTTP - Request to ${req.host}`,
        '',
        '## Request summary',
        '',
        `Full URI: ${uri}`,
        `  - Method: ${req.method}`,
        `  - Protocol: ${protocol} (HTTP/${req.http_version})`,
        `  - Host: ${req.host}`,
        `  - Port: ${req.server.port}`,
        `  - Path: ${req.path}`,
        ''
    ];

	
	if(req.queries.size > 0) {
		lines.push('### Query parameters');
		lines.push('');
        lines.push(...draw_table(['Parameter', 'Value(s)'], req.queries))
		lines.push('');
	}

    if(req.headers.size > 0) {
		lines.push('### Headers');
		lines.push('');
        const sorted_headers = new Map([...req.headers.entries()].sort((e1, e2) => e1[0].localeCompare(e2[0])));
        lines.push(...draw_table(['Header', 'Value(s)'], sorted_headers))
		lines.push('');
	}

    if(req.body !== null) {
        lines.push('### Body', '');
        if(req.body instanceof Buffer) {
            lines.push(...hexdump(req.body));
        } else {
            lines.push(req.body);
        }
        lines.push('');
    }

	return { lines: lines, content_type: 'text/plain' };
}
