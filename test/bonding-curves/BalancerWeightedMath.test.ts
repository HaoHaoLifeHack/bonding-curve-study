import { assert, expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("BalancerWeightedMath Gas Usage", function () {
    let owner: any;
    let totalSupply: any;
    async function deployTestContract() {
        const TestBalancerWeightedMath = await ethers.getContractFactory("TestBalancerWeightedMath");
        const testContract = await TestBalancerWeightedMath.deploy();
        await testContract.waitForDeployment();
        return testContract;
    }
    beforeEach(async function () {
        const [deployer] = await ethers.getSigners();
        owner = deployer;
        totalSupply = ethers.parseEther("1000000000"); //1e9 * 1e18
    });
    describe("Gas Usage Tests", function () {

        it("getBuyExactEthForToken", async function () {
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

        it("getBuyExactTokenForEth", async function () {
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
        
        it("getSellExactEthForToken", async function () {
            const testContract = await loadFixture(deployTestContract);

            const balanceIn = ethers.parseEther("18.123456789012345678");           // 池子中的 ETH
            const weightIn = ethers.parseEther("0.5");          // 0.5 weightIn
            const balanceOut = ethers.parseEther("1000000000"); // 池子中的 tokens
            const weightOut = ethers.parseEther("0.5");         // 0.5 weightOut
            const amountIn = ethers.parseEther("1.123456789012345678");            // 要賣的 ETH 數量

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
            console.log("On-chain  amount out (wei):", onChainResult);
            console.log("Off-chain amount out (wei):", offChainResult);
            console.log("On-chain  amount out (tokens):", ethers.formatEther(onChainResult));
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

        it("getSellExactTokenForEth", async function () {
            const testContract = await loadFixture(deployTestContract);

            const balanceIn = ethers.parseEther("1000000000");  // 池子中的 tokens
            const weightIn = ethers.parseEther("0.5");          // 0.5 weightIn
            const balanceOut = ethers.parseEther("18.123456789012345678"); // 池子中的 ETH
            const weightOut = ethers.parseEther("0.5");         // 0.5 weightOut
            const amountIn = ethers.parseEther("800000000");    // 要賣的 token 數量

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
            
            // 計算最終的 ETH 數量
            const offChainResult = BigInt(
                Math.floor(Number(balanceOut) * (1 - powerResult))
            );
            
            // 輸出計算結果
            console.log("\nCalculation Results:");
            console.log("On-chain  amount out (wei):", onChainResult);
            console.log("Off-chain amount out (wei):", offChainResult);
            console.log("On-chain  amount out (ETH):", ethers.formatEther(onChainResult));
            console.log("Off-chain amount out (ETH):", ethers.formatEther(offChainResult));
            
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

        it("test limitation of power calculation", async function () {
            const testContract = await loadFixture(deployTestContract);

            const balanceIn = ethers.parseEther("18.123456789012345678");           // 1 virtual ETH
            const weightIn = ethers.parseEther("0.018");        
            const balanceOut = ethers.parseEther("1000000000"); // 1e9 tokens total supply in ETH
            const weightOut = ethers.parseEther("1") - weightIn;         
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
    describe("Test Curve", function(){
        it.only("buy 6 ETH, get ? tokens", async function () { 
            const testContract = await loadFixture(deployTestContract);

            const balanceIn = ethers.parseEther("6");           // ETH in Pool (初始的 virtual ETH)
            const balanceOut = ethers.parseEther("1000000000"); // Meme in Pool (Total Supply 1e9 tokens)
            const weightIn = ethers.parseEther("0.5");          // 0.5 weightIn
            const weightOut = ethers.parseEther("0.5");         // 0.5 weightOut
            const amountIn = ethers.parseEther("6");            // user want to buy exact 6 eth
            const amountOut = await testContract.testComputeOutGivenExactIn(
                    balanceIn,
                    weightIn,
                    balanceOut,
                    weightOut,
                    amountIn
                );
            console.log(`user can get: ${ethers.formatEther(amountOut)} tokens`);
        });

        it.only("sell 500000000 tokens, get ? eth", async function () { 
            const testContract = await loadFixture(deployTestContract);

            const balanceIn = ethers.parseEther("500000000");   // Meme in Pool (初始 1e9 - 已被買走 5e8 tokens)
            const balanceOut = ethers.parseEther("12");         // ETH in Pool (初始 6 eth + 已買入 6 eth))
            const weightIn = ethers.parseEther("0.5");          // 0.5 weightIn
            const weightOut = ethers.parseEther("0.5");         // 0.5 weightOut
            const amountIn = ethers.parseEther("500000000");    // user want to sell exact 5e8 tokens                               
            
            const amountOut = await testContract.testComputeOutGivenExactIn(
                balanceIn, 
                weightIn,
                balanceOut, 
                weightOut,
                amountIn 
            );

            assert.equal(amountOut, ethers.parseEther("6"));
            console.log(`user can get: ${ethers.formatEther(amountOut)} eth`);
        });

        it.only("buy 500000000 tokens, need ? eth", async function () { 
            const testContract = await loadFixture(deployTestContract);

            const balanceIn = ethers.parseEther("6");           // ETH in Pool (初始 6 eth)
            const balanceOut = ethers.parseEther("1000000000"); // Meme in Pool (Total Supply 1e9 tokens)
            const weightIn = ethers.parseEther("0.5");          // 0.5 weightIn
            const weightOut = ethers.parseEther("0.5");         // 0.5 weightOut

            const amountOut = ethers.parseEther("500000000");   // user want to buy exact 5e8 tokens

            const amountIn = await testContract.testComputeInGivenExactOut(
                balanceIn,
                weightIn,
                balanceOut,
                weightOut,
                amountOut
            );

            assert.equal(amountIn, ethers.parseEther("6"));    // 計算需要付出 6 eth 才能買到 exact 5e8 tokens
            console.log(`user need to pay : ${ethers.formatEther(amountIn)} ETH`);
        });

        it.only("sell ? tokens, get 6 eth", async function () { 
            const testContract = await loadFixture(deployTestContract);

            const balanceIn = ethers.parseEther("500000000");  // Meme in Pool (初始 1e9 - 5e8)
            const balanceOut = ethers.parseEther("12");        // ETH in Pool (初始 6 eth + 已買入 6 eth)
            const weightIn = ethers.parseEther("0.5");         // 0.5 weightIn
            const weightOut = ethers.parseEther("0.5");        // 0.5 weightOut

            const amountOut = ethers.parseEther("6");   // user want to sell exact ? tokens for 6 eth

            const amountIn = await testContract.testComputeInGivenExactOut(
                balanceIn,
                weightIn,
                balanceOut,
                weightOut,
                amountOut
            );

            assert.equal(amountIn, ethers.parseEther("500000000"));    // 計算要賣出 exact 5e8 tokens 得到 6 eth
            console.log(`user need to sell : ${ethers.formatEther(amountIn)} tokens`);
        });
    })
}); 