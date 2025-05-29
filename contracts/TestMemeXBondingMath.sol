// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./MemeXBondingMath.sol";

contract TestMemeXBondingMath {
    using MemeXBondingMath for uint256;

    function testCalculateTokensForETH(
        uint256 ethReserve,
        uint256 tokenReserve,
        uint256 ethIn
    ) public pure returns (uint256) {
        return MemeXBondingMath.calculateTokensForETH(ethReserve, tokenReserve, ethIn);
    }

    function testCalculateETHForTokens(
        uint256 ethReserve,
        uint256 tokenReserve,
        uint256 tokenIn,
        uint256 sellFee
    ) public pure returns (uint256 ethOut, uint256 fee) {
        return MemeXBondingMath.calculateETHForTokens(ethReserve, tokenReserve, tokenIn, sellFee);
    }

    function testGetCurrentPrice(
        uint256 ethReserve,
        uint256 tokenReserve
    ) public pure returns (uint256) {
        return MemeXBondingMath.getCurrentPrice(ethReserve, tokenReserve);
    }
} 