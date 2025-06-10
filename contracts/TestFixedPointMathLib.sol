// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./dependencies/FixedPointMathLib.sol";

contract TestFixedPointMathLib {
    using FixedPointMathLib for uint256;

    function testMulWadDown(
        uint256 x,
        uint256 y
    ) public pure returns (uint256) {
        return x.mulWadDown(y);
    }

    function testMulWadUp(
        uint256 x,
        uint256 y
    ) public pure returns (uint256) {
        return x.mulWadUp(y);
    }

    function testDivWadDown(
        uint256 x,
        uint256 y
    ) public pure returns (uint256) {
        return x.divWadDown(y);
    }

    function testDivWadUp(
        uint256 x,
        uint256 y
    ) public pure returns (uint256) {
        return x.divWadUp(y);
    }

    function testRpow(
        uint256 x,
        uint256 n,
        uint256 scalar
    ) public pure returns (uint256) {
        return x.rpow(n, scalar);
    }

    function testSqrt(
        uint256 x
    ) public pure returns (uint256) {
        return x.sqrt();
    }

    function testUnsafeMod(
        uint256 x,
        uint256 y
    ) public pure returns (uint256) {
        return x.unsafeMod(y);
    }

    function testUnsafeDiv(
        uint256 x,
        uint256 y
    ) public pure returns (uint256) {
        return x.unsafeDiv(y);
    }

    function testUnsafeDivUp(
        uint256 x,
        uint256 y
    ) public pure returns (uint256) {
        return x.unsafeDivUp(y);
    }
} 