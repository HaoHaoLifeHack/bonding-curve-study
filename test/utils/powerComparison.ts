import { ethers } from "hardhat";
import Decimal from 'decimal.js';

// 設置 decimal.js 的精度
Decimal.set({ precision: 20 });

export class PowerComparison {
    /**
     * 使用 decimal.js 計算 power
     */
    static calculatePower(
        baseN: string | number,
        baseD: string | number,
        expN: string | number,
        expD: string | number
    ): Decimal {
        const base = new Decimal(baseN).div(baseD);
        const exp = new Decimal(expN).div(expD);
        return base.pow(exp);
    }

    /**
     * 比較鏈上和鏈下的計算結果
     */
    static async compareWithOnChain(
        contract: any,
        baseN: string | number,
        baseD: string | number,
        expN: string | number,
        expD: string | number
    ): Promise<{
        onChain: string;
        offChain: string;
        difference: string;
        percentageDiff: string;
    }> {
        // 鏈上計算
        const [onChainResult] = await contract.power(
            ethers.parseEther(baseN.toString()),
            ethers.parseEther(baseD.toString()),
            expN,
            expD
        );

        // 鏈下計算
        const offChainResult = this.calculatePower(baseN, baseD, expN, expD);

        // 轉換為相同格式進行比較
        const onChainDecimal = new Decimal(onChainResult.toString());
        const offChainDecimal = offChainResult;

        // 計算差異
        const difference = onChainDecimal.sub(offChainDecimal).abs();
        const percentageDiff = difference.div(onChainDecimal).mul(100);

        return {
            onChain: onChainDecimal.toString(),
            offChain: offChainDecimal.toString(),
            difference: difference.toString(),
            percentageDiff: percentageDiff.toString() + '%'
        };
    }
}

// 使用示例
async function example() {
    const Power = await ethers.getContractFactory("Power");
    const powerContract = await Power.deploy();
    await powerContract.waitForDeployment();

    const result = await PowerComparison.compareWithOnChain(
        powerContract,
        "1",    // baseN
        "1",    // baseD
        500000, // expN
        1000000 // expD
    );

    console.log("Comparison Results:");
    console.log("On-chain result:", result.onChain);
    console.log("Off-chain result:", result.offChain);
    console.log("Difference:", result.difference);
    console.log("Percentage difference:", result.percentageDiff);
} 