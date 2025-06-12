// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IBondingCurve {
  function getBuyExactEthForToken(uint256 ethReserve, uint256 tokenReserve, uint256 ethAmount) external view returns (uint256);
  function getBuyExactTokenForEth(uint256 ethReserve, uint256 tokenReserve, uint256 tokenAmount) external view returns (uint256);

  function getSellExactEthForToken(uint256 ethReserve, uint256 tokenReserve, uint256 ethAmount) external view returns (uint256);
  function getSellExactTokenForEth(uint256 ethReserve, uint256 tokenReserve, uint256 tokenAmount) external view returns (uint256);
}