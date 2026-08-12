// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AgentCredit ($CRED)
 * @notice ERC-20 token representing currency in the AgentX simulated economy.
 * Allows contract owner (orchestrator/deployer) to mint tokens to agent wallets.
 */
contract AgentCredit is ERC20, ERC20Burnable, Ownable {
    /**
     * @dev Constructor initializes the ERC20 token with name "AgentX Credit" and symbol "CRED".
     * @param initialOwner Address set as contract owner.
     * @param initialSupply Optional initial supply minted to initialOwner (in base units).
     */
    constructor(
        address initialOwner,
        uint256 initialSupply
    ) ERC20("AgentX Credit", "CRED") Ownable(initialOwner) {
        if (initialSupply > 0) {
            _mint(initialOwner, initialSupply);
        }
    }

    /**
     * @notice Mint new CRED tokens to a target agent address.
     * @param to Target address to receive minted tokens.
     * @param amount Amount of tokens (in base units) to mint.
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "AgentCredit: cannot mint to zero address");
        require(amount > 0, "AgentCredit: amount must be greater than 0");
        _mint(to, amount);
    }
}
