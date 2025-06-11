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

        it("should getBuyExactEthForToken", async function () {
            const testContract = await loadFixture(deployTestContract);

            const balanceIn = ethers.parseEther("18.123456789012345678");           // virtual ETH
            const weightIn = ethers.parseEther("0.5");          // 0.5 weightIn
            const balanceOut = ethers.parseEther("1000000000"); // 1e9 tokens
            const weightOut = ethers.parseEther("0.5");         // 0.5 weightOut
            const amountIn = ethers.parseEther("1.123456789012345678");            // Buy ExactETH

            // console.log(`params:\n balanceIn: ${balanceIn},\n weightIn: ${weightIn},\n balanceOut: ${balanceOut},\n weightOut: ${weightOut},\n amountIn: ${amountIn}`);
            // 測量 gas
            const gasUsed = await testContract.testComputeOutGivenExactIn.estimateGas(
                balanceIn,
                weightIn,
                balanceOut,
                weightOut,
                amountIn
            );
            
            console.log("\nTest Result:");
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
            console.log("On-chain  amount in (wei):", onChainResult);
            console.log("Off-chain amount in (wei):", offChainResult);

            console.log("On-chain  amount in (ETH):", ethers.formatEther(onChainResult));
            console.log("Off-chain amount in (ETH):", ethers.formatEther(offChainResult));
            
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

        it("should getBuyExactTokenForEth", async function () {
            const testContract = await loadFixture(deployTestContract);

            const balanceIn = ethers.parseEther("18.123456789012345678");           // 1 virtual ETH
            const weightIn = ethers.parseEther("0.5");          // 0.5 weightIn
            const balanceOut = ethers.parseEther("1000000000"); // 1e9 tokens total supply in ETH
            const weightOut = ethers.parseEther("0.5");         // 0.5 weightOut
            const amountOut = ethers.parseEther("800000000");   // Buy Exact 8e8 tokens 

            // console.log(`params:\n balanceIn: ${balanceIn},\n weightIn: ${weightIn},\n balanceOut: ${balanceOut},\n weightOut: ${weightOut},\n amountOut: ${amountOut}`);
            // 測量 gas
            const gasUsed = await testContract.testComputeInGivenExactOut.estimateGas(
                balanceIn,
                weightIn,
                balanceOut,
                weightOut,
                amountOut
            );
            
            console.log("computeInGivenExactOut gas used:", gasUsed.toString());
            
            // 鏈上計算結果
            const onChainResult = await testContract.testComputeInGivenExactOut(
                balanceIn,
                weightIn,
                balanceOut,
                weightOut,
                amountOut
            );
            
            // 鏈下計算結果
            // 使用 JS 的 BigInt 來計算，避免精度損失
            const base = balanceOut * BigInt(1e18) / (balanceOut - amountOut);  // 先乘以 1e18 再除，保持精度
            const expN = weightOut;
            const expD = weightIn;
            
            // 計算 (base/1e18)^(expN/expD)
            const powerResult = Math.pow(Number(base) / 1e18, Number(expN) / Number(expD));
            
            // 計算最終的 ETH 數量
            const offChainResult = BigInt(
                Math.floor(Number(balanceIn) * (powerResult - 1))
            );
            
            // 輸出計算結果
            console.log("\nCalculation Results:");
            console.log("On-chain  amount in (wei):", onChainResult);
            console.log("Off-chain amount in (wei):", offChainResult);
            console.log("On-chain  amount in (ETH):", ethers.formatEther(onChainResult));
            console.log("Off-chain amount in (ETH):", ethers.formatEther(offChainResult));
            
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

        it.only("test power calculation", async function () {
            const testContract = await loadFixture(deployTestContract);

            const balanceIn = ethers.parseEther("18.123456789012345678");           // 1 virtual ETH
            const weightIn = ethers.parseEther("0.1");          // 0.5 weightIn
            const balanceOut = ethers.parseEther("1000000000"); // 1e9 tokens total supply in ETH
            const weightOut = ethers.parseEther("0.9");         // 0.5 weightOut
            const amountOut = ethers.parseEther("800000000");   // Buy Exact 8e8 tokens 

            // console.log(`params:\n balanceIn: ${balanceIn},\n weightIn: ${weightIn},\n balanceOut: ${balanceOut},\n weightOut: ${weightOut},\n amountOut: ${amountOut}`);
            // 測量 gas
            const gasUsed = await testContract.testComputeInGivenExactOut.estimateGas(
                balanceIn,
                weightIn,
                balanceOut,
                weightOut,
                amountOut
            );
            
            console.log("computeInGivenExactOut gas used:", gasUsed.toString());
            
            // 鏈上計算結果
            const onChainResult = await testContract.testComputeInGivenExactOut(
                balanceIn,
                weightIn,
                balanceOut,
                weightOut,
                amountOut
            );
            
            // 鏈下計算結果
            // 使用 JS 的 BigInt 來計算，避免精度損失
            const base = balanceOut * BigInt(1e18) / (balanceOut - amountOut);  // 先乘以 1e18 再除，保持精度
            const expN = weightOut;
            const expD = weightIn;
            
            // 計算 (base/1e18)^(expN/expD)
            const powerResult = Math.pow(Number(base) / 1e18, Number(expN) / Number(expD));
            
            // 計算最終的 ETH 數量
            const offChainResult = BigInt(
                Math.floor(Number(balanceIn) * (powerResult - 1))
            );
            
            // 輸出計算結果
            console.log("\nCalculation Results:");
            console.log("On-chain  amount in (wei):", onChainResult);
            console.log("Off-chain amount in (wei):", offChainResult);
            console.log("On-chain  amount in (ETH):", ethers.formatEther(onChainResult));
            console.log("Off-chain amount in (ETH):", ethers.formatEther(offChainResult));
            
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