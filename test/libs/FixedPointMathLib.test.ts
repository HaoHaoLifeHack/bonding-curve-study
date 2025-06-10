import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import Decimal from 'decimal.js';
import { WAD, mulWadUp, divWadUp, rpow, divWadDown, mulWadDown } from '../utils/FixedPointMath';


describe("FixedPointMathLib", function () {
    let owner: any;
    let testFixedPointMathLib: any;

    async function deployContract() {
        const TestFixedPointMathLib = await ethers.getContractFactory("TestFixedPointMathLib");
        const contract = await TestFixedPointMathLib.deploy();
        await contract.waitForDeployment();
        return contract;
    }

    beforeEach(async function () {
        const [deployer] = await ethers.getSigners();
        owner = deployer;
        testFixedPointMathLib = await loadFixture(deployContract);
    });

    describe("mulWadDown", function () {
        it("should calculate mulWadDown correctly", async function () {
            // 測試 1.5 * 1.1 = 1.65
            const x = ethers.parseUnits("1.5", 18);
            const y = ethers.parseUnits("1.1", 18);
            
            // 鏈上計算
            const onChainResult = await testFixedPointMathLib.testMulWadDown(x, y);
            
            // 鏈下計算
            const xD = new Decimal(x.toString());
            const yD = new Decimal(y.toString());
            const offChainResult = mulWadDown(xD, yD);
            
            // 輸出結果
            console.log("\nMulWadDown Results:");
            console.log("On-chain result:", ethers.formatEther(onChainResult));
            console.log("Off-chain result:", ethers.formatEther(offChainResult.toFixed(0)));
            
            // 驗證結果
            expect(onChainResult).to.equal(BigInt(offChainResult.toFixed(0)));
        });
    });

    describe("mulWadUp", function () {
        it("should calculate mulWadUp correctly", async function () {
            // 測試 1.5 * 1.1 = 1.65
            const x = ethers.parseUnits("1.5", 18);
            const y = ethers.parseUnits("1.1", 18);
            
            // 鏈上計算
            const onChainResult = await testFixedPointMathLib.testMulWadUp(x, y);
            
            // 鏈下計算
            const xD = new Decimal(x.toString());
            const yD = new Decimal(y.toString());
            const offChainResult = mulWadUp(xD, yD);
            
            // 輸出結果
            console.log("\nMulWadUp Results:");
            console.log("On-chain result:", ethers.formatEther(onChainResult));
            console.log("Off-chain result:", ethers.formatEther(offChainResult.toFixed(0)));
            
            // 驗證結果
            expect(onChainResult).to.equal(BigInt(offChainResult.toFixed(0)));
        });
    });

    describe("divWadDown", function () {
        it("should calculate divWadDown correctly", async function () {
            // 測試 1.65 / 1.1 = 1.5
            const x = ethers.parseUnits("1.65", 18);
            const y = ethers.parseUnits("1.1", 18);
            
            // 鏈上計算
            const onChainResult = await testFixedPointMathLib.testDivWadDown(x, y);
            
            // 鏈下計算
            const xD = new Decimal(x.toString());
            const yD = new Decimal(y.toString());
            const offChainResult = divWadDown(xD, yD);
            
            // 輸出結果
            console.log("\nDivWadDown Results:");
            console.log("On-chain result:", ethers.formatEther(onChainResult));
            console.log("Off-chain result:", ethers.formatEther(offChainResult.toFixed(0)));
            
            // 驗證結果
            expect(onChainResult).to.equal(BigInt(offChainResult.toFixed(0)));
        });
    });

    describe("divWadUp", function () {
        it("should calculate divWadUp correctly", async function () {
            // 測試 1.65 / 1.1 = 1.5
            const x = ethers.parseUnits("1.65", 18);
            const y = ethers.parseUnits("1.1", 18);
            
            // 鏈上計算
            const onChainResult = await testFixedPointMathLib.testDivWadUp(x, y);
            
            // 鏈下計算
            const xD = new Decimal(x.toString());
            const yD = new Decimal(y.toString());
            const offChainResult = divWadUp(xD, yD);
            
            // 輸出結果
            console.log("\nDivWadUp Results:");
            console.log("On-chain result:", ethers.formatEther(onChainResult));
            console.log("Off-chain result:", ethers.formatEther(offChainResult.toFixed(0)));
            
            // 驗證結果
            expect(onChainResult).to.equal(BigInt(offChainResult.toFixed(0)));
        });
    });

    describe("rpow", function () {
        it("should calculate rpow correctly", async function () {
            // 測試 1.1^2 = 1.21
            const x = ethers.parseUnits("1.1", 18);
            const n = 2;
            
            // 鏈上計算
            const onChainResult = await testFixedPointMathLib.testRpow(x, n, WAD.toFixed(0));
            
            // 鏈下計算
            const xD = new Decimal(x.toString());
            const offChainResult = rpow(xD, n, WAD);
            
            // 輸出結果
            console.log("\nRpow Results:");
            console.log("On-chain result:", ethers.formatEther(onChainResult));
            console.log("Off-chain result:", ethers.formatEther(offChainResult.toFixed(0)));
            
            // 驗證結果
            expect(onChainResult).to.equal(BigInt(offChainResult.toFixed(0)));
        });
    });

    describe("sqrt", function () {
        it("should calculate sqrt correctly", async function () {
            // 測試 sqrt(4) = 2
            const x = ethers.parseUnits("4", 18);
            
            // 鏈上計算
            const onChainResult = await testFixedPointMathLib.testSqrt(x);
            
            // 鏈下計算
            const xD = new Decimal(x.toString());
            const offChainResult = xD.sqrt();
            
            // 輸出結果
            console.log("\nSqrt Results:");
            console.log("On-chain result:", ethers.formatEther(onChainResult));
            console.log("Off-chain result:", ethers.formatEther(offChainResult.toFixed(0)));
            
            // 驗證結果
            expect(onChainResult).to.equal(BigInt(offChainResult.toFixed(0)));
        });
    });

    describe("unsafeMod", function () {
        it("should calculate unsafeMod correctly", async function () {
            // 測試 5 % 2 = 1
            const x = ethers.parseUnits("5", 18);
            const y = ethers.parseUnits("2", 18);
            
            // 鏈上計算
            const onChainResult = await testFixedPointMathLib.testUnsafeMod(x, y);
            
            // 鏈下計算
            const xD = new Decimal(x.toString());
            const yD = new Decimal(y.toString());
            const offChainResult = xD.mod(yD);
            
            // 輸出結果
            console.log("\nUnsafeMod Results:");
            console.log("On-chain result:", ethers.formatEther(onChainResult));
            console.log("Off-chain result:", ethers.formatEther(offChainResult.toFixed(0)));
            
            // 驗證結果
            expect(onChainResult).to.equal(BigInt(offChainResult.toFixed(0)));
        });
    });

    describe("unsafeDiv", function () {
        it("should calculate unsafeDiv correctly", async function () {
            // 測試 6 / 2 = 3
            const x = ethers.parseUnits("6", 18);
            const y = ethers.parseUnits("2", 18);
            
            // 鏈上計算
            const onChainResult = await testFixedPointMathLib.testUnsafeDiv(x, y);
            
            // 鏈下計算
            const xD = new Decimal(x.toString());
            const yD = new Decimal(y.toString());
            const offChainResult = xD.div(yD).floor();
            
            // 輸出結果
            console.log("\nUnsafeDiv Results:");
            console.log("On-chain result:", ethers.formatEther(onChainResult));
            console.log("Off-chain result:", ethers.formatEther(offChainResult.toFixed(0)));
            
            // 驗證結果
            expect(onChainResult).to.equal(BigInt(offChainResult.toFixed(0)));
        });
    });

    describe("unsafeDivUp", function () {
        it("should calculate unsafeDivUp correctly", async function () {
            // 測試 5 / 2 = 3 (向上取整)
            const x = ethers.parseUnits("5", 18);
            const y = ethers.parseUnits("2", 18);
            
            // 鏈上計算
            const onChainResult = await testFixedPointMathLib.testUnsafeDivUp(x, y);
            
            // 鏈下計算
            const xD = new Decimal(x.toString());
            const yD = new Decimal(y.toString());
            const offChainResult = xD.div(yD).ceil();
            
            // 輸出結果
            console.log("\nUnsafeDivUp Results:");
            console.log("On-chain result:", ethers.formatEther(onChainResult));
            console.log("Off-chain result:", ethers.formatEther(offChainResult.toFixed(0)));
            
            // 驗證結果
            expect(onChainResult).to.equal(BigInt(offChainResult.toFixed(0)));
        });
    });
});