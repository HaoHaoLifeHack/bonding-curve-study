import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import Decimal from 'decimal.js';

// WAD helpers for 18 decimals
const WAD = new Decimal("1e18");
function mulWadUp(a: Decimal, b: Decimal): Decimal {
    return a.mul(b).add(WAD).sub(1).div(WAD).floor();
}
function divWadUp(a: Decimal, b: Decimal): Decimal {
    return a.mul(WAD).add(b).sub(1).div(b).floor();
}
function rpow(base: Decimal, exp: number, wad: Decimal): Decimal {
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
function divWadDown(a: Decimal, b: Decimal): Decimal {
    return a.mul(WAD).div(b).floor();
}

describe("ExponentialCurve", function () {
    let owner: any;

    async function deployContract() {
        const ExponentialCurve = await ethers.getContractFactory("ExponentialCurve");
        const contract = await ExponentialCurve.deploy();
        await contract.waitForDeployment();
        return contract;
    }

    beforeEach(async function () {
        const [deployer] = await ethers.getSigners();
        owner = deployer;
    });

    describe("getBuyInfo", function () {
        it("should calculate buy info correctly with 2 items", async function () {
            const contract = await loadFixture(deployContract);

            // Test parameters
            const spotPrice = ethers.parseUnits("0.1", 18); // 0.1 ETH/meme (100 ETH / 1000 meme)
            const delta = ethers.parseUnits("1.0001", 18);  // 0.0001%
            const numItems = 2;
            const feeMultiplier = 0;
            const protocolFeeMultiplier = 0;

            // Get gas estimate
            const gasUsed = await contract.getBuyInfo.estimateGas(
                spotPrice,
                delta,
                numItems,
                feeMultiplier,
                protocolFeeMultiplier
            );
            
            // 鏈上計算結果
            const onChainResult = await contract.getBuyInfo(
                spotPrice,
                delta,
                numItems,
                feeMultiplier,
                protocolFeeMultiplier
            );
            
            // 鏈下計算
            const spotPriceD = new Decimal(spotPrice.toString());
            const deltaD = new Decimal(delta.toString());
            const deltaPowN = rpow(deltaD, numItems, WAD);
            const newSpotPrice = mulWadUp(spotPriceD, deltaPowN);
            const buySpotPrice = mulWadUp(spotPriceD, deltaD);
            const numerator = deltaPowN.minus(WAD);
            const denominator = deltaD.minus(WAD);
            const frac = divWadUp(numerator, denominator);
            const inputValue = mulWadUp(buySpotPrice, frac);
            
            // 輸出計算結果
            console.log("\n" + "=".repeat(50));
            console.log(`Test Case: 2 items`);
            console.log("-".repeat(50));
            
            // Price comparison
            console.log("Price Comparison:");
            console.log(`On-chain new spot price : ${ethers.formatEther(onChainResult.newSpotPrice)}`);
            console.log(`Off-chain new spot price: ${ethers.formatEther(newSpotPrice.toFixed(0))}`);
            console.log(`On-chain input value : ${ethers.formatEther(onChainResult.inputValue)}`);
            console.log(`Off-chain input value: ${ethers.formatEther(inputValue.toFixed(0))}`);
            
            // Error analysis
            console.log("\nError Analysis:");
            const spotPriceDiff = onChainResult.newSpotPrice - BigInt(newSpotPrice.toFixed(0));
            const inputValueDiff = onChainResult.inputValue - BigInt(inputValue.toFixed(0));
            const spotPricePercentageDiff = (Number(spotPriceDiff) * 10000) / Number(onChainResult.newSpotPrice);
            const inputValuePercentageDiff = (Number(inputValueDiff) * 10000) / Number(onChainResult.inputValue);
            console.log(`Spot price difference: ${ethers.formatEther(spotPriceDiff)} (${spotPricePercentageDiff.toFixed(4)}%)`);
            console.log(`Input value difference: ${ethers.formatEther(inputValueDiff)} (${inputValuePercentageDiff.toFixed(4)}%)`);
            
            // Gas usage
            console.log("\nGas Usage:");
            console.log(`getBuyInfo gas used: ${gasUsed.toString()}`);
            console.log("=".repeat(50) + "\n");
            
            // 驗證結果
            expect(Number(onChainResult.error)).to.equal(0);
            expect(Number(onChainResult.newSpotPrice)).to.be.greaterThan(Number(spotPrice));
            expect(Number(onChainResult.inputValue)).to.be.greaterThan(0);
            // 驗證誤差在可接受範圍內（0.01%）
            expect(Math.abs(spotPricePercentageDiff)).to.be.lessThan(1);
            expect(Math.abs(inputValuePercentageDiff)).to.be.lessThan(1);
        });

        it("should calculate buy info correctly with 10 items", async function () {
            const contract = await loadFixture(deployContract);
            
            // 設置測試數據
            const spotPrice = ethers.parseUnits("0.1", 18); // 0.1 ETH/meme
            const delta = ethers.parseUnits("1.0001", 18); // 0.0001%
            const numItems = 1000;
            const feeMultiplier = 0;
            const protocolFeeMultiplier = 0;

            // 測量 gas
            const gasUsed = await contract.getBuyInfo.estimateGas(
                spotPrice,
                delta,
                numItems,
                feeMultiplier,
                protocolFeeMultiplier
            );
            
            // 鏈上計算結果
            const onChainResult = await contract.getBuyInfo(
                spotPrice,
                delta,
                numItems,
                feeMultiplier,
                protocolFeeMultiplier
            );
            
            // 鏈下計算
            const spotPriceD = new Decimal(spotPrice.toString());
            const deltaD = new Decimal(delta.toString());
            const deltaPowN = rpow(deltaD, numItems, WAD);
            const newSpotPrice = mulWadUp(spotPriceD, deltaPowN);
            const buySpotPrice = mulWadUp(spotPriceD, deltaD);
            const numerator = deltaPowN.minus(WAD);
            const denominator = deltaD.minus(WAD);
            const frac = divWadUp(numerator, denominator);
            const inputValue = mulWadUp(buySpotPrice, frac);
            
            // 輸出計算結果
            console.log("\n" + "=".repeat(50));
            console.log(`Test Case: 10 items`);
            console.log("-".repeat(50));
            
            // Price comparison
            console.log("Price Comparison:");
            console.log(`On-chain new spot price: ${ethers.formatEther(onChainResult.newSpotPrice)}`);
            console.log(`Off-chain new spot price: ${ethers.formatEther(newSpotPrice.toFixed(0))}`);
            console.log(`On-chain input value: ${ethers.formatEther(onChainResult.inputValue)}`);
            console.log(`Off-chain input value: ${ethers.formatEther(inputValue.toFixed(0))}`);
            
            // Error analysis
            console.log("\nError Analysis:");
            const spotPriceDiff = onChainResult.newSpotPrice - BigInt(newSpotPrice.toFixed(0));
            const inputValueDiff = onChainResult.inputValue - BigInt(inputValue.toFixed(0));
            const spotPricePercentageDiff = (Number(spotPriceDiff) * 10000) / Number(onChainResult.newSpotPrice);
            const inputValuePercentageDiff = (Number(inputValueDiff) * 10000) / Number(onChainResult.inputValue);
            console.log(`Spot price difference: ${ethers.formatEther(spotPriceDiff)} (${spotPricePercentageDiff.toFixed(4)}%)`);
            console.log(`Input value difference: ${ethers.formatEther(inputValueDiff)} (${inputValuePercentageDiff.toFixed(4)}%)`);
            
            // Gas usage
            console.log("\nGas Usage:");
            console.log(`getBuyInfo gas used: ${gasUsed.toString()}`);
            console.log("=".repeat(50) + "\n");
            
            // 驗證結果
            expect(Number(onChainResult.error)).to.equal(0);
            expect(Number(onChainResult.newSpotPrice)).to.be.greaterThan(Number(spotPrice));
            expect(Number(onChainResult.inputValue)).to.be.greaterThan(0);
            // 驗證誤差在可接受範圍內（0.01%）
            expect(Math.abs(spotPricePercentageDiff)).to.be.lessThan(1);
            expect(Math.abs(inputValuePercentageDiff)).to.be.lessThan(1);
        });

        it.only("should analyze price bias and gas cost across different purchase amounts", async function () {
            const contract = await loadFixture(deployContract);
            
            // 測試案例
            const testCases = [
                { numItems: 1, description: "最小購買量" },
                { numItems: 100, description: "小量購買" },
                { numItems: 1000, description: "中等購買量" },
                { numItems: 10000, description: "大量購買" },
                { numItems: 100000, description: "超大量購買" },
                { numItems: 1000000, description: "極大量購買" },
                { numItems: 10000000, description: "接近上限購買" },
                { numItems: 800000000, description: "上限購買" }
            ];

            // 固定參數
            const spotPrice = ethers.parseUnits("0.00000002", 18);  // 2e-8 ETH
            const delta = ethers.parseUnits("1.0000000042", 18);  // 1.0000000042
            const feeMultiplier = 0;
            const protocolFeeMultiplier = 0;

            // 結果收集
            const results = [];

            for (const testCase of testCases) {
                // 測量 gas
                const gasUsed = await contract.getBuyInfo.estimateGas(
                    spotPrice,
                    delta,
                    testCase.numItems,
                    feeMultiplier,
                    protocolFeeMultiplier
                );

                // 鏈上計算
                const onChainResult = await contract.getBuyInfo(
                    spotPrice,
                    delta,
                    testCase.numItems,
                    feeMultiplier,
                    protocolFeeMultiplier
                );

                // 鏈下計算
                const spotPriceD = new Decimal(spotPrice.toString());
                const deltaD = new Decimal(delta.toString());
                const deltaPowN = rpow(deltaD, testCase.numItems, WAD);
                const newSpotPrice = mulWadUp(spotPriceD, deltaPowN);
                const buySpotPrice = mulWadUp(spotPriceD, deltaD);
                const numerator = deltaPowN.minus(WAD);
                const denominator = deltaD.minus(WAD);
                const frac = divWadUp(numerator, denominator);
                const inputValue = mulWadUp(buySpotPrice, frac);

                // 計算誤差
                const spotPriceDiff = onChainResult.newSpotPrice - BigInt(newSpotPrice.toFixed(0));
                const inputValueDiff = onChainResult.inputValue - BigInt(inputValue.toFixed(0));
                const spotPricePercentageDiff = (Number(spotPriceDiff) * 10000) / Number(onChainResult.newSpotPrice);
                const inputValuePercentageDiff = (Number(inputValueDiff) * 10000) / Number(onChainResult.inputValue);

                // 收集結果
                results.push({
                    numItems: testCase.numItems,
                    description: testCase.description,
                    gasUsed: gasUsed.toString(),
                    spotPriceBias: spotPricePercentageDiff,
                    inputValueBias: inputValuePercentageDiff,
                    onChainSpotPrice: ethers.formatEther(onChainResult.newSpotPrice),
                    offChainSpotPrice: ethers.formatEther(newSpotPrice.toFixed(0)),
                    onChainInputValue: ethers.formatEther(onChainResult.inputValue),
                    offChainInputValue: ethers.formatEther(inputValue.toFixed(0))
                });
            }

            // 輸出分析結果
            console.log("\nPerformance Analysis Results:");
            console.log("==========================================");
            for (const result of results) {
                console.log("\n" + "=".repeat(50));
                console.log(`Test Case: ${result.description} (${result.numItems} items)`);
                console.log("-".repeat(50));
                
                // Price comparison
                console.log("Price Comparison:");
                console.log(`On-chain  new spot price: ${result.onChainSpotPrice}`);
                console.log(`Off-chain new spot price: ${result.offChainSpotPrice}`);
                console.log(`On-chain  input value: ${result.onChainInputValue}`);
                console.log(`Off-chain input value: ${result.offChainInputValue}`);
                
                // Error analysis
                console.log("\nError Analysis:");
                console.log(`Spot price bias : ${result.spotPriceBias.toFixed(4)}%`);
                console.log(`Input value bias: ${result.inputValueBias.toFixed(4)}%`);
                
                // Gas usage
                console.log("\nGas Usage:");
                console.log(`getBuyInfo gas used: ${result.gasUsed}`);
                console.log("=".repeat(50) + "\n");
            }

            // 驗證所有誤差都在，假設可接受範圍為 0.01%
            for (const result of results) {
                expect(Math.abs(result.spotPriceBias)).to.be.lessThan(0.01);  // 0.01% 誤差
                expect(Math.abs(result.inputValueBias)).to.be.lessThan(0.01);  // 0.01% 誤差
            }
        });
    });
    /*
        describe("getSellInfo", function () {
            it("should calculate sell info correctly", async function () {
                const contract = await loadFixture(deployContract);
                
                // 設置測試數據
                const spotPrice = ethers.parseUnits("0.1", 18); // 0.1 ETH/meme (100 ETH / 1000 meme)
                const delta = ethers.parseUnits("2", 18); // 2
                const numItems = 2;
                const feeMultiplier = 0;
                const protocolFeeMultiplier = 0;

                // 測量 gas
                const gasUsed = await contract.getSellInfo.estimateGas(
                    spotPrice,
                    delta,
                    numItems,
                    feeMultiplier,
                    protocolFeeMultiplier
                );
                
                // 鏈上計算結果
                const onChainResult = await contract.getSellInfo(
                    spotPrice,
                    delta,
                    numItems,
                    feeMultiplier,
                    protocolFeeMultiplier
                );
                
                // 鏈下計算
                const spotPriceD = new Decimal(spotPrice.toString());
                const deltaD = new Decimal(delta.toString());
                const invDelta = divWadDown(WAD, deltaD);
                const invDeltaPowN = rpow(invDelta, numItems, WAD);
                const newSpotPrice = mulWadUp(spotPriceD, invDeltaPowN);
                const numerator = WAD.minus(invDeltaPowN);
                const denominator = WAD.minus(invDelta);
                const frac = divWadDown(numerator, denominator);
                const outputValue = mulWadUp(spotPriceD, frac);
                
                // 輸出計算結果
                console.log("\nSell Info Results (10 ETH):");
                console.log("On-chain new spot price:", ethers.formatEther(onChainResult.newSpotPrice));
                console.log("On-chain output value:", ethers.formatEther(onChainResult.outputValue));
                console.log("Off-chain new spot price:", ethers.formatEther(newSpotPrice.toFixed(0)));
                console.log("Off-chain output value:", ethers.formatEther(outputValue.toFixed(0)));
                
                // 計算誤差
                const spotPriceDiff = onChainResult.newSpotPrice - BigInt(newSpotPrice.toFixed(0));
                const outputValueDiff = onChainResult.outputValue - BigInt(outputValue.toFixed(0));
                const spotPricePercentageDiff = (Number(spotPriceDiff) * 10000) / Number(onChainResult.newSpotPrice);
                const outputValuePercentageDiff = (Number(outputValueDiff) * 10000) / Number(onChainResult.outputValue);
                
                console.log("New spot price difference:", ethers.formatEther(spotPriceDiff));
                console.log("Output value difference:", ethers.formatEther(outputValueDiff));
                console.log("New spot price percentage difference:", spotPricePercentageDiff.toFixed(4), "%");
                console.log("Output value percentage difference:", outputValuePercentageDiff.toFixed(4), "%");
                console.log("getSellInfo gas used:", gasUsed.toString());
                
                // 驗證結果
                expect(Number(onChainResult.error)).to.equal(0);
                expect(Number(onChainResult.newSpotPrice)).to.be.lessThan(Number(spotPrice));
                expect(Number(onChainResult.outputValue)).to.be.greaterThan(0);
                // 驗證誤差在可接受範圍內（0.01%）
                expect(Math.abs(spotPricePercentageDiff)).to.be.lessThan(1);
                expect(Math.abs(outputValuePercentageDiff)).to.be.lessThan(1);
            });
        });
    */
}); 