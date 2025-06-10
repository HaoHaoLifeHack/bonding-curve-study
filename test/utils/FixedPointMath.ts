import Decimal from 'decimal.js';

// WAD helpers for 18 decimals
export const WAD = new Decimal("1e18");

export function mulWadUp(a: Decimal, b: Decimal): Decimal {
    return a.mul(b).add(WAD).sub(1).div(WAD).floor();
}
export function mulWadDown(a: Decimal, b: Decimal): Decimal {
    return a.mul(b).div(WAD).floor();
}

export function divWadUp(a: Decimal, b: Decimal): Decimal {
    return a.mul(WAD).add(b).sub(1).div(b).floor();
}

export function rpow(base: Decimal, exp: number, wad: Decimal): Decimal {
    let result = wad;
    let x = base;
    let n = exp;
    while (n > 0) {
        if (n % 2 === 1) {
            result = result.mul(x).div(wad).floor();
        }
        x = x.mul(x).div(wad).floor();
        n = Math.floor(n / 2);
    }
    return result;
}

export function divWadDown(a: Decimal, b: Decimal): Decimal {
    return a.mul(WAD).div(b).floor();
} 