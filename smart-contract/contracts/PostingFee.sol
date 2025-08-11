// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title Posting Fee Manager
/// @notice Charges a small fee in USDC to post project ideas or user profiles.
/// @dev Contract owner can adjust the fee amount or disable it entirely.
contract PostingFee {
    /// -----------------------------------------------------------------------
    /// Storage
    /// -----------------------------------------------------------------------

    /// @notice Address of the contract owner allowed to change settings
    address public owner;

    /// @notice ERC20 token used for payment (USDC token)
    IERC20 public immutable usdc;

    /// @notice Amount charged for each post in smallest USDC units (6 decimals)
    uint256 public postPrice;

    /// @notice Toggle to enable or disable charging a fee
    bool public feesEnabled;

    /// -----------------------------------------------------------------------
    /// Events
    /// -----------------------------------------------------------------------

    /// @notice Emitted when a user pays the fee for an action
    /// @param payer Address paying the fee
    /// @param action Description of the action paid for ("project" or "profile")
    /// @param amount Amount of USDC paid
    event FeePaid(address indexed payer, string action, uint256 amount);

    /// @notice Emitted when the owner withdraws accumulated fees
    /// @param to Address receiving the withdrawn USDC
    /// @param amount Amount of USDC sent to the owner
    event FeesWithdrawn(address indexed to, uint256 amount);

    /// -----------------------------------------------------------------------
    /// Modifiers
    /// -----------------------------------------------------------------------

    /// @dev Reverts if called by anyone other than the owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    /// -----------------------------------------------------------------------
    /// Constructor
    /// -----------------------------------------------------------------------

    /// @param usdcToken Address of the USDC token contract
    constructor(address usdcToken) {
        owner = msg.sender;
        usdc = IERC20(usdcToken);
        postPrice = 1e6; // 1 USDC assuming 6 decimals
        feesEnabled = true;
    }

    /// -----------------------------------------------------------------------
    /// Fee payment functions
    /// -----------------------------------------------------------------------

    /// @notice Pay the fee to post a project idea
    function payForProjectPost() external {
        _collectFee("project");
    }

    /// @notice Pay the fee to post a profile
    function payForProfilePost() external {
        _collectFee("profile");
    }

    /// @dev Internal function that handles fee collection and event emission
    /// @param action Description of the action the user is paying for
    function _collectFee(string memory action) internal {
        require(feesEnabled, "Fees disabled");
        // Transfer USDC from the user to this contract for later withdrawal
        require(
            usdc.transferFrom(msg.sender, address(this), postPrice),
            "Payment failed"
        );
        emit FeePaid(msg.sender, action, postPrice);
    }

    /// -----------------------------------------------------------------------
    /// Owner functions
    /// -----------------------------------------------------------------------

    /// @notice Update the fee amount
    /// @param newPrice New price in smallest USDC units (6 decimals)
    function setPostPrice(uint256 newPrice) external onlyOwner {
        postPrice = newPrice;
    }

    /// @notice Enable or disable fee collection
    /// @param enabled Pass true to enable fees or false to disable
    function setFeesEnabled(bool enabled) external onlyOwner {
        feesEnabled = enabled;
    }

    /// @notice Withdraw accumulated USDC fees to the owner's address
    function withdrawFees() external onlyOwner {
        uint256 balance = usdc.balanceOf(address(this));
        require(balance > 0, "No fees to withdraw");
        require(usdc.transfer(owner, balance), "Withdraw failed");
        emit FeesWithdrawn(owner, balance);
    }
}
