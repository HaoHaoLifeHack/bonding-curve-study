import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("HighStreetBancorBondingCurve", function () {
    let owner: any;
    async function deployTestContract() {
        const HighStreetBancorBondingCurve = await ethers.getContractFactory("HighStreetBancorBondingCurve");
        const contract = await HighStreetBancorBondingCurve.deploy();
        await contract.waitForDeployment();
        return contract;
    }

    beforeEach(async function () {
        const [deployer] = await ethers.getSigners();
        owner = deployer;
    });

    describe("Buy Operations", function () {
        it("should calculate correct buy price with 50% reserve ratio", async function () {
            const contract = await loadFixture(deployTestContract);
            
            // 設置測試數據
            const ethAmount = ethers.parseEther("10");  // 10 ETH
            const supply = 1000n;   // 1000 tokens
            const reserveRatio = 500000n;               // 50% reserve ratio
            const ethReserve = ethers.parseEther("100"); // 100 ETH

            // 測量 gas
            const gasUsed = await contract.calculatePurchaseReturn.estimateGas(
                supply,
                ethReserve,
                reserveRatio,
                ethAmount,
            );
            
            // 鏈上計算結果
            const onChainResult = await contract.calculatePurchaseReturn(
                supply,
                ethReserve,
                reserveRatio,
                ethAmount
            );
            
            // 鏈下計算結果
            // 使用 JS 的 Math.pow 來計算
            const baseN = Number(ethers.formatEther(ethReserve + ethAmount));  // ethReserve + ethAmount
            const baseD = Number(ethers.formatEther(ethReserve));             // ethReserve
            const expN = Number(reserveRatio);  // reserveRatio
            const expD = 1000000;  // MAX_RESERVE_RATIO

            // 計算 (baseN/baseD)^(expN/expD)
            const powerResult = Math.pow(baseN / baseD, expN / expD);
            
            // 計算最終的 token 數量
            const offChainResult = BigInt(
                Math.floor(Number(supply) * (powerResult - 1))
            );
            
            // 輸出計算結果
            console.log("\nCalculation Results (50% Reserve Ratio):");
            console.log("On-chain amount out (tokens):", onChainResult.toString());
            console.log("Off-chain amount out (tokens):", offChainResult.toString());
            
            // 計算誤差
            const difference = Number(onChainResult - offChainResult);
            const percentageDiff = (Math.abs(difference) * 10000) / Number(onChainResult);
            
            console.log("Difference:", difference);
            console.log("Percentage difference:", percentageDiff.toFixed(4), "%");
            console.log("calculatePurchaseReturn gas used:", gasUsed.toString());
            
            // 驗證結果大於0
            expect(Number(onChainResult)).to.be.greaterThan(0);
            // 驗證誤差在可接受範圍內（0.01%）
            expect(percentageDiff).to.be.lessThan(1);
        });

        it("should calculate correct buy price with 10% reserve ratio", async function () {
            const contract = await loadFixture(deployTestContract);
            
            // 設置測試數據
            const ethAmount = ethers.parseEther("10");  // 10 ETH
            const supply = 1000n;   // 1000 tokens
            const reserveRatio = 100000n;               // 10% reserve ratio
            const ethReserve = ethers.parseEther("100"); // 100 ETH

            // 測量 gas
            const gasUsed = await contract.calculatePurchaseReturn.estimateGas(
                supply,
                ethReserve,
                reserveRatio,
                ethAmount,
            );
            
            // 鏈上計算結果
            const onChainResult = await contract.calculatePurchaseReturn(
                supply,
                ethReserve,
                reserveRatio,
                ethAmount
            );
            
            // 鏈下計算結果
            // 使用 JS 的 Math.pow 來計算
            const baseN = Number(ethers.formatEther(ethReserve + ethAmount));  // ethReserve + ethAmount
            const baseD = Number(ethers.formatEther(ethReserve));             // ethReserve
            const expN = Number(reserveRatio);  // reserveRatio
            const expD = 1000000;  // MAX_RESERVE_RATIO

            // 計算 (baseN/baseD)^(expN/expD)
            const powerResult = Math.pow(baseN / baseD, expN / expD);
            
            // 計算最終的 token 數量
            const offChainResult = BigInt(
                Math.floor(Number(supply) * (powerResult - 1))
            );
            
            // 輸出計算結果
            console.log("\nCalculation Results (10% Reserve Ratio):");
            console.log("On-chain amount out (tokens):", onChainResult.toString());
            console.log("Off-chain amount out (tokens):", offChainResult.toString());
            
            // 計算誤差
            const difference = Number(onChainResult - offChainResult);
            const percentageDiff = (Math.abs(difference) * 10000) / Number(onChainResult);
            
            console.log("Difference:", difference);
            console.log("Percentage difference:", percentageDiff.toFixed(4), "%");
            console.log("calculatePurchaseReturn gas used:", gasUsed.toString());
            
            // 驗證結果大於0
            expect(Number(onChainResult)).to.be.greaterThan(0);
            // 驗證誤差在可接受範圍內（0.01%）
            expect(percentageDiff).to.be.lessThan(1);
        });

        // it("should calculate correct sell price", async function () {
        //     const contract = await loadFixture(deployTestContract);
            
        //     // 設置測試數據 - 與其他測試保持一致
        //     const tokenAmount = ethers.parseEther("100");                   // 100 tokens
        //     const supply = ethers.parseEther("1000");                       // 1000 tokens
        //     const reserveRatio = 500000n;               // 50% reserve ratio
        //     const ethReserve = ethers.parseEther("100"); // 100 ETH

        //     // 測量 gas
        //     const gasUsed = await contract.calculatePriceForNTokens.estimateGas(
        //         supply,
        //         reserveRatio,
        //         ethReserve
        //     );
            
        //     // 執行計算
        //     const result = await contract.calculatePriceForNTokens(
        //         supply,
        //         reserveRatio,
        //         ethReserve
        //     );
            
        //     console.log(`Sell ${tokenAmount} tokens: ${ethers.formatEther(result)} ETH`);
        //     console.log("Gas used:", gasUsed.toString());
            
        //     expect(result).to.be.gt(0n);
        // });
    });
}); 