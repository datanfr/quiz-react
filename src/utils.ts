export const groupBy = <T, K extends keyof any>(list: T[], getKey: (item: T) => K) =>
    list.reduce((previous, currentItem) => {
        const group = getKey(currentItem);
        previous[group] = currentItem;
        return previous;
    }, {} as Record<K, T>);


export type Hsl = { h: number, s: number, l: number }
export type Hwb = { h: number, w: number, b: number }

export function hexToHSL(hex: string): Hsl {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) {
        debugger;
        return { h: 0, s: 0, l: 0 }
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
    return { h: h * 360, s, l };
}

export function lerp(start: number, end: number, amt: number) {
    return (1 - amt) * start + amt * end
}

export const hwbLerp = (amt: number, colorGradient : {start: Hwb, end:Hwb}) => {
    //amt = (amt - 0.3) / (0.70 - 0.30)
    return {
        h: lerp(colorGradient.start.h, colorGradient.end.h, amt),
        w: lerp(colorGradient.start.w, colorGradient.end.w, amt),
        b: lerp(colorGradient.start.b, colorGradient.end.b, amt)
    }
}

export const hwb = {
    green: {h:169, w:0, b:0.28},
    yellow: {h:37, w:0.29, b:0},
    red: {h:352, w:0.15, b:0.23},
}

export const hslToCss = ({ h, s, l }: Hsl) => `hsl(${h},${s * 100}%, ${l * 100}%)`;
export const hslaToCss = ({ h, s, l }: Hsl, opacity: number) => `hsl(${h},${s * 100}%, ${l * 100}%, ${opacity})`;
export const hwbToCss = ({ h, w, b }: Hwb) => `hwb(${h} ${w * 100}% ${b * 100}%)`;

(window as any).colorTool = {
    lerp,
    hwbLerp,
    hwbToCss,
    hslToCss,
    hslaToCss
}