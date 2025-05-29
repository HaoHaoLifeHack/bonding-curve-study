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
        it("should calculate correct buy price", async function () {
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
            
            // 執行計算
            const result = await contract.calculatePurchaseReturn(
                supply,
                ethReserve,
                reserveRatio,
                ethAmount
            );
            
            console.log(`Buy with ${ethers.formatEther(ethAmount)} ETH: ${result} tokens`);
            console.log("calculatePurchaseReturn gas used:", gasUsed.toString());
            
            expect(Number(result)).to.be.greaterThan(0);
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