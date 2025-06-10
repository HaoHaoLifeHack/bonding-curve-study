import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("MemeXBondingMath", function () {
    let owner: any;
    async function deployTestContract() {
        const TestMemeXBondingMath = await ethers.getContractFactory("TestMemeXBondingMath");
        const contract = await TestMemeXBondingMath.deploy();
        await contract.waitForDeployment();
        return contract;
    }

    beforeEach(async function () {
        const [deployer] = await ethers.getSigners();
        owner = deployer;
    });

    describe("calculateTokensForETH", function () {
        it("should calculate tokens for ETH with initial 10 ETH", async function () {
            const contract = await loadFixture(deployTestContract);
            
            // 設置測試數據
            const ethAmount = ethers.parseEther("10");  // 用 10 ETH 購買
            const ethReserve = ethers.parseEther("100"); // 100 ETH
            const tokenReserve = ethers.parseEther("1000"); // 1000 tokens

            // 測量 gas
            const gasUsed = await contract.testCalculateTokensForETH.estimateGas(
                ethReserve,
                tokenReserve,
                ethAmount
            );
            
            // 鏈上計算結果
            const onChainResult = await contract.testCalculateTokensForETH(
                ethReserve,
                tokenReserve,
                ethAmount
            );
            
            // 鏈下計算結果
            // 使用 JS 的 BigInt，避免精度損失
            const offChainResult = (ethAmount * tokenReserve) / (ethReserve + ethAmount);
            
            // 輸出計算結果
            console.log("\nCalculation Results (10 ETH):");
            console.log("On-chain amount out (tokens):", ethers.formatEther(onChainResult));
            console.log("Off-chain amount out (tokens):", ethers.formatEther(offChainResult));
            
            // 計算誤差
            const difference = onChainResult - offChainResult;
            const percentageDiff = (Number(difference) * 10000) / Number(onChainResult);
            
            console.log("Difference:", ethers.formatEther(difference));
            console.log("Percentage difference:", percentageDiff.toFixed(4), "%");
            console.log("calculateTokensForETH gas used:", gasUsed.toString());
            
            // 驗證結果大於0
            expect(Number(onChainResult)).to.be.greaterThan(0);
            // 驗證誤差在可接受範圍內（0.01%）
            expect(Math.abs(percentageDiff)).to.be.lessThan(1);
        });

        it("should calculate tokens for ETH with 0.0001 ethReserve", async function () {
            const contract = await loadFixture(deployTestContract);
            
            // 設置測試數據
            const ethAmount = ethers.parseEther("10");  // 用 10 ETH 購買
            const ethReserve = ethers.parseEther("0.0001"); // 0.0001 ETH
            const tokenReserve = ethers.parseEther("1000"); // 1000 tokens

            // 測量 gas
            const gasUsed = await contract.testCalculateTokensForETH.estimateGas(
                ethReserve,
                tokenReserve,
                ethAmount
            );
            
            // 鏈上計算結果
            const onChainResult = await contract.testCalculateTokensForETH(
                ethReserve,
                tokenReserve,
                ethAmount
            );
            
            // 鏈下計算結果
            // 使用 JS 的 BigInt，避免精度損失
            const offChainResult = (ethAmount * tokenReserve) / (ethReserve + ethAmount);
            
            // 輸出計算結果
            console.log("\nCalculation Results (0.0001 ethReserve):");
            console.log("On-chain amount out (tokens):", ethers.formatEther(onChainResult));
            console.log("Off-chain amount out (tokens):", ethers.formatEther(offChainResult));
            
            // 計算誤差
            const difference = onChainResult - offChainResult;
            const percentageDiff = (Number(difference) * 10000) / Number(onChainResult);
            
            console.log("Difference:", ethers.formatEther(difference));
            console.log("Percentage difference:", percentageDiff.toFixed(4), "%");
            console.log("calculateTokensForETH gas used:", gasUsed.toString());
            
            // 驗證結果大於0
            expect(Number(onChainResult)).to.be.greaterThan(0);
            // 驗證誤差在可接受範圍內（0.01%）
            expect(Math.abs(percentageDiff)).to.be.lessThan(1);
        });
    });

    // describe("getCurrentPrice", function () {
    //     it("should calculate current price and measure gas", async function () {
    //         const contract = await loadFixture(deployTestContract);
            
    //         // 設置測試數據 - 與其他測試保持一致
    //         const ethReserve = ethers.parseEther("100");  // 100 ETH
    //         const tokenReserve = ethers.parseEther("1000"); // 1000 tokens

    //         // 測量 gas
    //         const gasUsed = await contract.testGetCurrentPrice.estimateGas(
    //             ethReserve,
    //             tokenReserve
    //         );
            
    //         // 執行計算
    //         const result = await contract.testGetCurrentPrice(
    //             ethReserve,
    //             tokenReserve
    //         );
            
    //         console.log(`Current price: ${ethers.formatEther(result)} ETH per token`);
    //         console.log("Gas used:", gasUsed.toString());
            
    //         expect(Number(result)).to.be.greaterThan(0);
    //     });
    // });
    // describe("calculateETHForTokens", function () {
    //     it("should calculate ETH for tokens and measure gas", async function () {
    //         const contract = await loadFixture(deployTestContract);
            
    //         // 設置測試數據 - 與其他測試保持一致
    //         const tokenAmount = ethers.parseEther("100"); // 100 tokens
    //         const ethReserve = ethers.parseEther("100");  // 100 ETH
    //         const tokenReserve = ethers.parseEther("1000"); // 1000 tokens

    //         // 測量 gas
    //         const gasUsed = await contract.testCalculateETHForTokens.estimateGas(
    //             tokenAmount,
    //             ethReserve,
    //             tokenReserve
    //         );
            
    //         // 執行計算
    //         const [ethAmount, fee] = await contract.testCalculateETHForTokens(
    //             tokenAmount,
    //             ethReserve,
    //             tokenReserve
    //         );
            
    //         console.log(`ETH for ${ethers.formatEther(tokenAmount)} tokens: ${ethers.formatEther(ethAmount)} ETH, Fee: ${ethers.formatEther(fee)} ETH`);
    //         console.log("Gas used:", gasUsed.toString());
            
    //         expect(Number(ethAmount)).to.be.greaterThan(0);
    //         expect(Number(fee)).to.be.greaterThan(0);
    //     });
    // });
}); 