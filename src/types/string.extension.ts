
declare global {
    interface String {
        one_line(): string;
    }
}

String.prototype.one_line = function(this: String): string {
    return this.split(/\s+/).filter(s => s.length > 0).join(' '); 
} 

export {}