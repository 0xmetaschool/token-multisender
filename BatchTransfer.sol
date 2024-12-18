// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 
{
    // function transfer(address recipient, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
}

library SafeERC20 
{
    function safeTransferFrom(IERC20 token,address sender,address recipient,uint256 amount) internal 
    {
        // Call transferFrom
        (bool success, bytes memory data) = address(token).call(
            abi.encodeWithSelector(token.transferFrom.selector,sender,recipient,amount)
        );
        require(success && (data.length == 0 || abi.decode(data, (bool))),"SafeERC20: Transfer failed");
    }
}

contract BatchTransfer 
{
    using SafeERC20 for IERC20;
    function batchSendETH(address[] calldata recipients, uint256[] calldata amounts) external payable 
    {   
        require(recipients.length > 0, "No recipients provided");
        require(amounts.length > 0, "No amounts provided");
        require(recipients.length == amounts.length, "Mismatched recipients and amounts");

        uint256 total = 0;
        for (uint256 i = 0; i < amounts.length; i++) 
        {
            require(recipients[i] != address(0), "Invalid recipient address");
            require(amounts[i] > 0, "Amount must be greater than 0");
            total += amounts[i];
        }
        require(msg.value >= total, "Insufficient ETH sent");

        for (uint256 i = 0; i < recipients.length; i++) 
        {
            (bool success, ) = payable(recipients[i]).call{value: amounts[i]}("");
            if (!success) { revert("ETH transfer failed");}
        }
    }


    function batchSendERC20(address token,address[] calldata recipients,uint256[] calldata amounts) external 
    { 
        require(token != address(0), "Invalid token address");
        require(recipients.length > 0, "No recipients provided");
        require(amounts.length > 0, "No amounts provided");
        require(recipients.length == amounts.length, "Mismatched recipients and amounts");

        for (uint256 i = 0; i < recipients.length; i++) 
        {
            require(recipients[i] != address(0), "Invalid recipient address");
            require(amounts[i] > 0, "Amount must be greater than 0");
            IERC20(token).safeTransferFrom(msg.sender, recipients[i], amounts[i]);
        }
    }

    receive() external payable {}
}
// sepolia -  0x41c108bba45ffc0ceee17a1dabaddd738bd3ab43
// Amoy   -  0xC09605fe77FfF000979a246b12c6fCaad0E7E722







// We use a low-level call instead of direct function calls
// abi.encodeWithSelector creates the function call data
// This handles tokens like USDT that don't return values correctly
// We check both the success status AND the returned data


// Why USDT/USDC Fails with Direct Transfer:


// USDT was created before the ERC20 standard was finalized
// It doesn't return a boolean for transfer/transferFrom
// When called directly in web3/ethers, the libraries handle this
// But when called from a contract, the missing return value causes an error