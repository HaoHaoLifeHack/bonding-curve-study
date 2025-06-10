import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("BalancerWeightedMath Gas Usage", function () {
    let owner: any;
    async function deployTestContract() {
        const TestBalancerWeightedMath = await ethers.getContractFactory("TestBalancerWeightedMath");
        const testContract = await TestBalancerWeightedMath.deploy();
        await testContract.waitForDeployment();
        return testContract;
    }
    beforeEach(async function () {
        const [deployer] = await ethers.getSigners();
        owner = deployer;
    });
    describe("Gas Usage Tests", function () {
        it("should measure gas for computeOutGivenExactIn", async function () {
            const testContract = await loadFixture(deployTestContract);
            
            // 設置測試數據
            const balanceIn = ethers.parseEther("100");    // 100 ETH
            const weightIn = ethers.parseEther("0.8");     // 80% ETH weight
            const balanceOut = ethers.parseEther("1000");  // 1000 tokens
            const weightOut = ethers.parseEther("0.2");    // 20% token weight
            const amountIn = ethers.parseEther("10");      // 10 ETH

            // 測量 gas
            const gasUsed = await testContract.testComputeOutGivenExactIn.estimateGas(
                balanceIn,
                weightIn,
                balanceOut,
                weightOut,
                amountIn
            );
            
            console.log("computeOutGivenExactIn gas used:", gasUsed.toString());
            
            // 鏈上計算結果
            const onChainResult = await testContract.testComputeOutGivenExactIn(
                balanceIn,
                weightIn,
                balanceOut,
                weightOut,
                amountIn
            );
            
            // 鏈下計算結果
            // 使用 JS 的 BigInt 來計算，避免精度損失
            const denominator = balanceIn + amountIn;
            const base = (balanceIn * BigInt(1e18)) / denominator;  // 先乘以 1e18 再除，保持精度
            const expN = weightIn;
            const expD = weightOut;
            
            // 計算 (base/1e18)^(expN/expD)
            const powerResult = Math.pow(Number(base) / 1e18, Number(expN) / Number(expD));
            
            // 計算最終的 token 數量
            const offChainResult = BigInt(
                Math.floor(Number(balanceOut) * (1 - powerResult))
            );
            
            // 輸出計算結果
            console.log("\nCalculation Results:");
            console.log("On-chain amount out (tokens):", ethers.formatEther(onChainResult));
            console.log("Off-chain amount out (tokens):", ethers.formatEther(offChainResult));
            
            // 計算誤差
            const difference = onChainResult - offChainResult;
            const percentageDiff = (Number(difference) * 10000) / Number(onChainResult);
            
            console.log("Difference:", ethers.formatEther(difference));
            console.log("Percentage difference:", percentageDiff.toFixed(4), "%");
            
            // 驗證結果大於0
            expect(Number(onChainResult)).to.be.greaterThan(0);
            // 驗證誤差在可接受範圍內（0.01%）
            expect(Math.abs(percentageDiff)).to.be.lessThan(1);
        });

        it("should measure gas for computeOutGivenExactIn with extreme values", async function () {
            const testContract = await loadFixture(deployTestContract);
            
            // 設置極端測試數據
            const balanceIn = ethers.parseEther("100");    // 100 ETH
            const weightIn = ethers.parseEther("0.99");        // 99% ETH weight
            const balanceOut = ethers.parseEther("1000");       // 1000 tokens
            const weightOut = ethers.parseEther("0.01");       // 1% token weight
            const amountIn = ethers.parseEther("10");      // 10 ETH

            // 測量 gas
            const gasUsed = await testContract.testComputeOutGivenExactIn.estimateGas(
                balanceIn,
                weightIn,
                balanceOut,
                weightOut,
                amountIn
            );
            
            console.log("\nExtreme Values Test:");
            console.log("computeOutGivenExactIn gas used:", gasUsed.toString());
            
            // 鏈上計算結果
            const onChainResult = await testContract.testComputeOutGivenExactIn(
                balanceIn,
                weightIn,
                balanceOut,
                weightOut,
                amountIn
            );
            
            // 鏈下計算結果
            // 使用 JS 的 BigInt 來計算，避免精度損失
            const denominator = balanceIn + amountIn;
            const base = (balanceIn * BigInt(1e18)) / denominator;  // 先乘以 1e18 再除，保持精度
            const expN = weightIn;
            const expD = weightOut;
            
            // 計算 (base/1e18)^(expN/expD)
            const powerResult = Math.pow(Number(base) / 1e18, Number(expN) / Number(expD));
            
            // 計算最終的 token 數量
            const offChainResult = BigInt(
                Math.floor(Number(balanceOut) * (1 - powerResult))
            );
            
            // 輸出計算結果
            console.log("\nCalculation Results:");
            console.log("On-chain amount out (tokens):", ethers.formatEther(onChainResult));
            console.log("Off-chain amount out (tokens):", ethers.formatEther(offChainResult));
            
            // 計算誤差
            const difference = onChainResult - offChainResult;
            const percentageDiff = (Number(difference) * 10000) / Number(onChainResult);
            
            console.log("Difference:", ethers.formatEther(difference));
            console.log("Percentage difference:", percentageDiff.toFixed(4), "%");
            
            // 驗證結果大於0
            expect(Number(onChainResult)).to.be.greaterThan(0);
            // 驗證誤差在可接受範圍內（0.01%）
            expect(Math.abs(percentageDiff)).to.be.lessThan(1);
        });
    });
}); 