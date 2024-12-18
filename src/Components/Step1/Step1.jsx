import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import './Step1.css';

// const CONTRACT_ADDRESS = "0x40BFA789014FCC59922585D08DB3C64F9eb7e445"; //0x0Ce7cF16730733aef9C988C1b9269Ce75834CE9A

let CONTRACT_ABI = 
[
  "function batchSendETH(address[] calldata recipients, uint256[] calldata amounts) external payable",
  "function batchSendERC20(address token, address[] calldata recipients, uint256[] calldata amounts) external",
];

const tokenContracts = 
{
  USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  META: "0xd312f1C56bfe9be58a36C4747a945FC699a9C079"
};

const Step1 = ({ sharedState, updateSharedState, onNext }) => {
  const [customTokenDetails, setCustomTokenDetails] = useState(null);

  const connectToMetaMask = async () => {
    // console.log("connectToMetaMask calling");
    if (window.ethereum) 
    {
      try 
      {
        let accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        let provider = new ethers.providers.Web3Provider(window.ethereum);
        let signer = provider.getSigner();
        let network = await provider.getNetwork();
        // console.log(network);
        // console.log("Account: ", accounts[0]);
        // console.log(sharedState.CONTRACT_ADDRESS);
        let contract = new ethers.Contract(sharedState.CONTRACT_ADDRESS, CONTRACT_ABI, signer);

        let balance = await signer.getBalance();

        updateSharedState({
          walletAddress: accounts[0],
          provider: provider,
          signer: signer,
          contract: contract,
          ethBalance: ethers.utils.formatEther(balance) + " ETH"
        });

        // if(sharedState.selectedToken !== "ETH" && provider)
        //   {
        //     const tokenAddress = sharedState.selectedToken === "CUSTOM" ? sharedState.customTokenAddress : tokenContracts[sharedState.selectedToken];
        //     // console.log("tokenAddress: ", tokenAddress);
        //     let token_contract = new ethers.Contract(tokenAddress, [
        //       "function balanceOf(address) view returns (uint256)",
        //       "function decimals() view returns (uint8)"
        //     ], provider);
        //     // console.log("token_contract: ", token_contract); // Add this line to log the token_contract
        //     // console.log("provider address", typeof(provider.address));
        //     // console.log("sharedState.walletAddress=", sharedState.walletAddress);
        //     let token_balance = await token_contract.balanceOf(sharedState.walletAddress);
        //     let decimals = await token_contract.decimals(); // Get the decimal value for the token
        //     setCustomTokenDetails({ balance: ethers.utils.formatUnits(token_balance, 18)});
        //     let formattedBalance = ethers.utils.formatUnits(balance, decimals);
        //     updateSharedState({ custom_token_balance: formattedBalance });
        //   }

      } catch (error) {
        // console.error("Error connecting to wallet:", error);
        // updateSharedState({ errorMessage: "Error connecting to wallet" });
      }
    } else {
      console.error("Metamask not detected");
      updateSharedState({ errorMessage: "Metamask not detected" });
    }
  };

  useEffect(() => 
  {
    connectToMetaMask();
  }, []);
  useEffect(() =>
  {
    if (sharedState.CONTRACT_ADDRESS) 
    {
      connectToMetaMask();  // Only call after CONTRACT_ADDRESS has been updated
    }
  }, [sharedState.CONTRACT_ADDRESS]);  // Dependency on CONTRACT_ADDRESS
  

  const handleCustomTokenChange = async (event) => {

      updateSharedState({approved_i:false});
    let tokenAddress = event.target.value;
    updateSharedState({ customTokenAddress: tokenAddress });

    if (!ethers.utils.isAddress(tokenAddress)) {
      setCustomTokenDetails(null);
      updateSharedState({ errorMessage: "Invalid token address" });
      return;
    }

    try 
    {
      let provider = new ethers.providers.Web3Provider(window.ethereum);
      let contract = new ethers.Contract(tokenAddress, [
        "function name() view returns (string)",
        "function symbol() view returns (string)",
        "function balanceOf(address) view returns (uint256)",
        "function decimals() view returns (uint8)" // Add the decimals function
    ], provider);

      let name = await contract.name();
      let symbol = await contract.symbol();
      let balance = await contract.balanceOf(sharedState.walletAddress);
      let decimals = await contract.decimals(); // Get the decimal value for the token
      

      // // console.log("balance=",balance);
      setCustomTokenDetails({ 
        name, 
        symbol, 
        balance: ethers.utils.formatUnits(balance, 18)
      });
      let formattedBalance = ethers.utils.formatUnits(balance, decimals);
      updateSharedState({ custom_token_balance: formattedBalance });
      updateSharedState({ custom_token_symbol: symbol });
      updateSharedState({ errorMessage:""})
    } catch (error) {
      console.error("Error fetching custom token details:", error);
      setCustomTokenDetails(null);
    }
  };



  const handleTokenChange = async (i) => 
  {
    if(i !="ETH")
    {
      updateSharedState({approved_i:false});
    }
    // console.log("handletokenchange calling");
    if(i != "CUSTOM" &&  i != "ETH"  )
    {
      try 
      {
        let provider = new ethers.providers.Web3Provider(window.ethereum);
        let contract = new ethers.Contract(tokenContracts[i], [
            "function name() view returns (string)",
            "function symbol() view returns (string)",
            "function balanceOf(address) view returns (uint256)",
            "function decimals() view returns (uint8)" // Add the decimals function
        ], provider);
        
        // Fetch token details
        let name = await contract.name();
        let symbol = await contract.symbol();
        let balance = await contract.balanceOf(sharedState.walletAddress);
        let decimals = await contract.decimals(); // Get the decimal value for the token
        
        // console.log("name=",name);
        // console.log("symbol=",symbol);
        // console.log("balance=",balance.toString());
        // console.log("decimals=",decimals);
        // Format balance using the decimals value dynamically
        let formattedBalance = ethers.utils.formatUnits(balance, decimals);
        
        // Update shared state with the formatted balance
        updateSharedState({ token_balance: formattedBalance });
        
      } 
      catch (error) 
      {
        console.error("Error fetching  token details:", error);
      }
    }
  };


  const validateInput = (line) => {
    
    let parts = line.trim().split(',').map(part => part.trim());
    if (parts.length !== 2) { 
      console.error(`Invalid input format: ${line}`); 
      return null;
    }
    let [address, amountStr] = parts;

    try {
      let validAddress = ethers.utils.getAddress(address);
      let parsedAmount = amountStr && amountStr !== '' ? ethers.utils.parseUnits(amountStr, 18) : null;
      if (!parsedAmount || parsedAmount.lte(0)) { 
        console.error(`Invalid amount: ${amountStr}`); 
        return null;
      }
      return { address: validAddress, amount: parsedAmount };
    } catch (error) {
      console.error(`Validation error for input: ${line}`, error);
      return null;
    }
  };

  const handleInputChange = (event) => {
    if(sharedState.selectedToken !="ETH")
{
  updateSharedState({approved_i:false});
}
    let lines = event.target.value.split("\n");
    let validatedData = lines.map(validateInput).filter(item => item !== null);

    if (validatedData.length > 0) {
      updateSharedState({
        addresses: validatedData.map(d => d.address),
        amounts: validatedData.map(d => d.amount),
        errorMessage: ""
      });
    } else {
      updateSharedState({ errorMessage: "Invalid input. Please check addresses and amounts." });
    }
  };

  const handleCSVUpload = (event) => {
    let file = event.target.files[0];
    if (!file) return;

    let reader = new FileReader();
    reader.onload = (e) => {
      let lines = e.target.result.split("\n");
      let validatedData = lines.map(validateInput).filter(item => item !== null);

      if (validatedData.length > 0) {
        updateSharedState({
          addresses: validatedData.map(d => d.address),
          amounts: validatedData.map(d => d.amount),
          errorMessage: ""
        });
      } else {
        updateSharedState({ errorMessage: "Invalid CSV input. Please check addresses and amounts." });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      {/* <h2>Batch Transfer - Prepare</h2> */}
      <button onClick={connectToMetaMask}>    
        {/* {sharedState.walletAddress ? `Connected: ${sharedState.walletAddress.slice(0, 10)} ..... ${sharedState.walletAddress.slice(-10)}` : "Connect to MetaMask"} */}
        {sharedState.walletAddress ? `Connected: ${sharedState.walletAddress}` : "Connect to MetaMask"}
      </button>

      <div>
      <h3>Select Network</h3>
      <select
  value={sharedState.CONTRACT_ADDRESS}
  onChange={(e) => {
    updateSharedState({ CONTRACT_ADDRESS: e.target.value })
  }}
>
  <option value="0x41c108bba45ffc0ceee17a1dabaddd738bd3ab43">Ethereum Sepolia Testnet</option>
  {/* <option value="0xC09605fe77FfF000979a246b12c6fCaad0E7E722">Polygon Amoy Testnet</option> */}
  <option value="0xA899118f4BCCb62F8c6A37887a4F450D8a4E92E0">Ethereum Mainnet</option>
</select>


        <h3>Select Token</h3>
        
        <select 
          value={sharedState.selectedToken} 
          onChange={(e) => 
            {
              updateSharedState({ selectedToken: e.target.value })
              handleTokenChange(e.target.value)   
            }}>
          <option value="ETH">ETH</option>
          <option value="USDT">USDT</option>
          <option value="USDC">USDC</option>
          <option value="WETH">WETH </option>
          <option value="DAI">DAI </option>
          <option value="META">Sepoila META</option>
          <option value="CUSTOM">Custom Token</option>
        </select>


        {sharedState.selectedToken === "CUSTOM" && (
          <div>
            <input 
              type="text" 
              placeholder="Enter custom token address" 
              value={sharedState.customTokenAddress} 
              onChange={handleCustomTokenChange} 
              style={{ width: "100%" }}
            />
            {/* {customTokenDetails && (
              <div>
                <p>Name: {customTokenDetails.name}</p>
                <p>Symbol: {customTokenDetails.symbol}</p>
                <p>Balance: {customTokenDetails.balance}</p>
              </div>
            )} */}
          </div>
        )}
      </div>

      <textarea 
        rows={10} 
        cols={50} 
        placeholder="Enter addresses and amounts (e.g., 0x123...,1.0)" 
        onChange={handleInputChange}
      />
      <input type="file" accept=".csv" onChange={handleCSVUpload} />
      {sharedState.errorMessage && (
        <div style={{ color: 'red', marginTop: '10px' }}>{sharedState.errorMessage}</div>
      )}
      
      <button 
        onClick={onNext} 
        disabled={sharedState.addresses.length === 0}>
        Next: Confirm
      </button>
    </div>
  );
};

export default Step1;


