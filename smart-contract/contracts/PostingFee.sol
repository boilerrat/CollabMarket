// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title Posting Fee Manager
/// @notice Charges a small fee in USDC to post project ideas or user profiles.
/// @dev Contract owner can adjust the fee amount or disable it entirely.
contract PostingFee is Ownable2Step, ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// -----------------------------------------------------------------------
    /// Storage
    /// -----------------------------------------------------------------------

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

    /// @notice Emitted when the post price is updated
    event PostPriceUpdated(uint256 oldPrice, uint256 newPrice);

    /// @notice Emitted when fees are enabled or disabled
    event FeesEnabledUpdated(bool oldEnabled, bool newEnabled);

    /// -----------------------------------------------------------------------
    /// Constructor
    /// -----------------------------------------------------------------------

    /// @param usdcToken Address of the USDC token contract
    constructor(address usdcToken) Ownable(msg.sender) {
        require(usdcToken != address(0), "invalid USDC");
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
        // Transfer USDC from the user to this contract and verify exact amount received
        uint256 balanceBefore = usdc.balanceOf(address(this));
        usdc.safeTransferFrom(msg.sender, address(this), postPrice);
        uint256 balanceAfter = usdc.balanceOf(address(this));
        require(balanceAfter - balanceBefore == postPrice, "Incorrect amount received");
        emit FeePaid(msg.sender, action, postPrice);
    }

    /// -----------------------------------------------------------------------
    /// Owner functions
    /// -----------------------------------------------------------------------

    /// @notice Update the fee amount
    /// @param newPrice New price in smallest USDC units (6 decimals)
    function setPostPrice(uint256 newPrice) external onlyOwner {
        uint256 old = postPrice;
        postPrice = newPrice;
        emit PostPriceUpdated(old, newPrice);
    }

    /// @notice Enable or disable fee collection
    /// @param enabled Pass true to enable fees or false to disable
    function setFeesEnabled(bool enabled) external onlyOwner {
        bool old = feesEnabled;
        feesEnabled = enabled;
        emit FeesEnabledUpdated(old, enabled);
    }

    /// @notice Withdraw accumulated USDC fees to the owner's address
    function withdrawFees() external onlyOwner nonReentrant {
        uint256 balance = usdc.balanceOf(address(this));
        require(balance > 0, "No fees to withdraw");
        usdc.safeTransfer(owner(), balance);
        emit FeesWithdrawn(owner(), balance);
    }

    /// @notice Recover arbitrary ERC20 tokens mistakenly sent to this contract
    /// @dev Prevent recovering the configured USDC via this method to preserve accounting via withdrawFees
    function recoverERC20(IERC20 token, address to, uint256 amount) external onlyOwner {
        require(address(token) != address(usdc), "use withdrawFees for USDC");
        require(to != address(0), "invalid to");
        token.safeTransfer(to, amount);
    }

    /// @notice Sweep any ETH mistakenly sent to this contract
    function sweepETH(address payable to) external onlyOwner nonReentrant {
        require(to != address(0), "invalid to");
        uint256 amount = address(this).balance;
        require(amount > 0, "No ETH to sweep");
        (bool ok, ) = to.call{value: amount}("");
        require(ok, "ETH transfer failed");
    }
}
