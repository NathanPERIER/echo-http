

const hex_chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];

function byte_to_string(byte: number): string {
    return hex_chars[(byte & 0b11110000) >> 4] + hex_chars[byte & 0b00001111];
}


export function hexdump(data: Buffer): string[] {
    let res: string[] = [];
    for(let i = 0; i < data.length; i += 16) {
        const nbytes = (data.length - i < 16) ? data.length - i : 16;
        let line = ''
        for(let j = 0; j < nbytes; j++) {
            line += (byte_to_string(data.readUInt8(i + j)) + " ");
            if(j % 4 === 3) {
                line += " ";
            }
        }
        res.push(line);
    }
    return res;
}
