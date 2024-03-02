
declare global {
    interface String {
        one_line(): string;
        centre(total_length: number): string;
        ljust(total_length: number): string;
    }
}

String.prototype.one_line = function(this: String): string {
    return this.split(/\s+/).filter(s => s.length > 0).join(' '); 
}

String.prototype.centre = function(this: String, total_length: number): string {
    if(this.length >= total_length) {
        return this.toString();
    }
    const left_pad = Math.floor((total_length - this.length) / 2);
    const right_pad = total_length - (this.length + left_pad);
    return ' '.repeat(left_pad) + this + ' '.repeat(right_pad);
}

String.prototype.ljust = function(this: String, total_length: number): string {
    if(this.length >= total_length) {
        return this.toString();
    }
    return this + ' '.repeat(total_length - this.length);
}

export {}