// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol";

contract MetaToken is ERC20, Ownable {
    uint256 public constant MINT_AMOUNT = 10 * (10 ** 18); // 10 tokens (assuming 18 decimals)
    uint256 public constant MINT_INTERVAL = 24 hours; // 24 hours interval

    mapping(address => uint256) private lastMintTime;

    constructor() ERC20("Meta", "META") Ownable(msg.sender) {
        _mint(msg.sender, 1000 * (10 ** 18)); // Initial supply for the owner
    }

    /**
     * @dev Allows users to mint 10 tokens once every 24 hours.
     */
    function faucet() external {
        require(block.timestamp >= lastMintTime[msg.sender] + MINT_INTERVAL, "Minting is allowed only once in 24 hours");

        // Update last mint time
        lastMintTime[msg.sender] = block.timestamp;

        // Mint tokens to the user
        _mint(msg.sender, MINT_AMOUNT);
    }

    /**
     * @dev Checks when the user can mint again.
     * @param account The address of the user.
     * @return Remaining time in seconds until the user can mint again.
     */
    function timeUntilNextMint(address account) external view returns (uint256) {
        if (block.timestamp >= lastMintTime[account] + MINT_INTERVAL) {
            return 0;
        }
        return (lastMintTime[account] + MINT_INTERVAL) - block.timestamp;
    }
}
//0xd312f1C56bfe9be58a36C4747a945FC699a9C079
