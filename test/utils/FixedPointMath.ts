import Decimal from 'decimal.js';

// WAD constant for 18 decimals
export const WAD = new Decimal("1e18");

/**
 * Multiplies two numbers and rounds up
 * @param a First number
 * @param b Second number
 * @returns (a * b) / WAD rounded up
 */
export function mulWadUp(a: Decimal, b: Decimal): Decimal {
    // 1. 先做乘法
    const product = a.mul(b);
    // 2. 除以 WAD
    const quotient = product.div(WAD).floor();
    // 3. 檢查是否有餘數
    const remainder = product.mod(WAD);
    // 4. 如果有餘數，結果加 1
    return remainder.gt(0) ? quotient.add(1) : quotient;
}

/**
 * Divides two numbers and rounds up
 * @param a First number
 * @param b Second number
 * @returns (a * WAD) / b rounded up
 */
export function divWadUp(a: Decimal, b: Decimal): Decimal {
    // 1. 先做乘法 (a * WAD)
    const product = a.mul(WAD);
    // 2. 除以 b
    const quotient = product.div(b).floor();
    // 3. 檢查是否有餘數
    const remainder = product.mod(b);
    // 4. 如果有餘數，結果加 1
    return remainder.gt(0) ? quotient.add(1) : quotient;
}

/**
 * Calculates x^n with rounding
 * @param base Base number
 * @param exp Exponent
 * @param wad WAD constant
 * @returns base^exp with proper rounding
 */
export function rpow(base: Decimal, exp: number, wad: Decimal): Decimal {
    // 處理特殊情況
    if (base.eq(0)) {
        if (exp === 0) {
            return wad; // 0 ** 0 = 1
        }
        return new Decimal(0); // 0 ** n = 0
    }

    let result = wad;
    let x = base;
    let n = exp;

    // 如果 n 是奇數，先將 x 存入 result
    if (n % 2 === 1) {
        result = x;
    }

    // 計算 half = wad / 2
    const half = wad.div(2).floor();

    while (n > 0) {
        // 計算 x 的平方
        const xx = x.mul(x);
        // 加上 half 並除以 wad
        const xxRound = xx.add(half).div(wad).floor();
        x = xxRound;

        // 如果 n 是偶數
        if (n % 2 === 0) {
            // 計算 result * x
            const zx = result.mul(x);
            // 加上 half 並除以 wad
            const zxRound = zx.add(half).div(wad).floor();
            result = zxRound;
        }

        n = Math.floor(n / 2);
    }

    return result;
}

/**
 * Divides two numbers and rounds down
 * @param a First number
 * @param b Second number
 * @returns (a * WAD) / b rounded down
 */
export function divWadDown(a: Decimal, b: Decimal): Decimal {
    // 1. 先做乘法 (a * WAD)
    const product = a.mul(WAD);
    // 2. 除以 b 並向下取整
    return product.div(b).floor();
} 