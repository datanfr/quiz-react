export const groupBy = <T, K extends keyof any>(list: T[], getKey: (item: T) => K) =>
    list.reduce((previous, currentItem) => {
        const group = getKey(currentItem);
        previous[group] = currentItem;
        return previous;
    }, {} as Record<K, T>);


type Hsl = {h:number,s:number,l:number}

export function hexToHSL(hex : string) : Hsl {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) {
        debugger;
        return {h:0, s:0, l:0}
    } 
    let r = parseInt(result[1], 16);
    let g = parseInt(result[2], 16);
    let b = parseInt(result[3], 16);
    r /= 255;
    g /= 255;
    b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;
    if (max == min) {
        h = s = 0; // achromatic
    } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
            default: throw Error("Should not happend")
        }
        h /= 6;
    }
    return {h: h*360,s,l};
}

export const hslToCss = ({h,s,l}:Hsl) =>  `hsl(${h},${s*100}%, ${l*100}%)`
export const hslaToCss = ({h,s,l}:Hsl, opacity : number) =>  `hsl(${h},${s*100}%, ${l*100}%, ${opacity})`