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
            
            // 驗證結果
            const result = await testContract.testComputeOutGivenExactIn(
                balanceIn,
                weightIn,
                balanceOut,
                weightOut,
                amountIn
            );
            
            // 輸出計算結果
            console.log("Amount out (tokens):", ethers.formatEther(result));
            
            // 驗證結果大於0
            expect(Number(result)).to.be.greaterThan(0);
        });
    });
}); 