// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.24;

import "./BalancerWeightedMath.sol";

contract TestBalancerWeightedMath {
    using BalancerWeightedMath for uint256;

    function testComputeOutGivenExactIn(
        uint256 balanceIn,
        uint256 weightIn,
        uint256 balanceOut,
        uint256 weightOut,
        uint256 amountIn
    ) public pure returns (uint256) {
        return BalancerWeightedMath.computeOutGivenExactIn(
            balanceIn,
            weightIn,
            balanceOut,
            weightOut,
            amountIn
        );
    }

    function testComputeInGivenExactOut(
        uint256 balanceIn,
        uint256 weightIn,
        uint256 balanceOut,
        uint256 weightOut,
        uint256 amountOut
    ) public pure returns (uint256) {
        return BalancerWeightedMath.computeInGivenExactOut(
            balanceIn,
            weightIn,
            balanceOut,
            weightOut,
            amountOut
        );
    }
} 