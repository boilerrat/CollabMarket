// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @dev Simple ERC20 token with 6 decimals for testing purposes.
contract MockUSDC is ERC20 {
    constructor() ERC20("Mock USDC", "USDC") {}

    /// @notice Mint tokens for testing
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    /// @dev Override decimals to match USDC's 6 decimals
    function decimals() public pure override returns (uint8) {
        return 6;
    }
}
