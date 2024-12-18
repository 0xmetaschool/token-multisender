import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import './Step3.css';

let tokenContracts = 
{
  USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  META: "0xd312f1C56bfe9be58a36C4747a945FC699a9C079"
};

let Step3 = ({ sharedState, updateSharedState, onBack }) => 
{
  let [isLoading, setIsLoading] = useState(false);
  let [downloadLink, setDownloadLink] = useState("");

  // Generate a CSV receipt
  let generateCSV = () => {
    let headers = ["Recipient", "Amount (ETH)", "Transaction Status"];
    let rows = sharedState.addresses.map((address, index) => {
      return [
        address,
        ethers.utils.formatUnits(sharedState.amounts[index], 18), // Format amounts to ETH
        // sharedState.receipt === 1 ? "Success" : "Failed", // Transaction status
        "Success", // Transaction status
      ];
    });

    // Prepare CSV content
    let csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    // Add Sender Address and Estimated Gas info at the top
    let senderAddressRow = `Sender Address: ${sharedState.walletAddress}, Estimated Gas: ${ethers.utils.formatUnits(sharedState.estimatedGas, 0)} wei`;
    let finalCSV = `${senderAddressRow}\n\n${csvContent}`;

    // Create a Blob and URL for downloading
    let blob = new Blob([finalCSV], { type: "text/csv" });
    let url = URL.createObjectURL(blob);
    setDownloadLink(url);
  };

  let handleSend = async () => {
    if (sharedState.addresses.length === 0 || sharedState.amounts.length === 0) {
      updateSharedState({ errorMessage: "No valid transactions!" });
      return;
    }

    setIsLoading(true);
    updateSharedState({ errorMessage: "" });

    try 
    {
      let { provider, signer, contract, selectedToken, addresses, amounts, customTokenAddress } = sharedState;
      let network = await provider.getNetwork();
      //console.log("Current Network:", network);

      if (selectedToken === "ETH") 
      {
        let totalValue = amounts.reduce((acc, amount) => acc.add(amount), ethers.BigNumber.from(0));
        let estimatedGas = await contract.estimateGas.batchSendETH(addresses, amounts, { value: totalValue });
        let tx = await contract.batchSendETH(addresses, amounts, {
          value: totalValue,
          gasLimit: estimatedGas,
        });

        let receipt = await tx.wait();
        //console.log("Transaction Receipt:",  receipt.status);
        updateSharedState({
          receipt: receipt.status,
          txnHash: tx.hash,
          errorMessage: "",
          estimatedGas: estimatedGas.toString(),
        });
        generateCSV(); 
      } 
      else 
      
      {
        let tokenAddress = sharedState.selectedToken === "CUSTOM" ? sharedState.customTokenAddress : tokenContracts[sharedState.selectedToken];
        let tokenContract = new ethers.Contract(tokenAddress,
          ["function approve(address spender, uint256 amount) external returns (bool)",
            "function allowance(address owner, address spender) view returns (uint256)",
            "function decimals() view returns (uint8)",
            "function safeApprove(address spender, uint256 amount) external;"
          ],
          sharedState.signer
        );

      let decimals = await tokenContract.decimals();
      // console.log("decimal=", decimals);

      let adjustAmountDecimals = async (amount, fromDecimals, toDecimals) => {
        // Convert to a regular number string with fromDecimals
        let normalizedAmount = ethers.utils.formatUnits(amount, fromDecimals);
        // Parse back with correct decimals
        return ethers.utils.parseUnits(normalizedAmount, toDecimals);
      };

      // Adjust amounts to the correct decimals
      let adjustedAmounts = await Promise.all(sharedState.amounts.map(async (amount) => {return adjustAmountDecimals(amount, 18, decimals);}));

      // console.log("Adjusted amounts:", adjustedAmounts.map(a => a.toString()));

      let totalAmount = adjustedAmounts.reduce(
        (acc, amount) => acc.add(amount),
        ethers.BigNumber.from(0)
      );

      // console.log("Total Amount:", totalAmount.toString());

      let txn = await contract.batchSendERC20(
        tokenAddress,
        sharedState.addresses,
        adjustedAmounts,
        { gasLimit: 210000 },
        // { gasLimit: sharedState.estimatedGas }
      );
        let receipt = await txn.wait();
        updateSharedState({
          receipt: receipt.status,
          txnHash: txn.hash,
          errorMessage: "",
          estimatedGas: sharedState.estimatedGas.toString(),
        });
        generateCSV(); 
      }

      
    } 
    catch (error) {
      console.error("Transaction Error:", error);

      let detailedErrorMessage = "Transaction failed: ";
      if (error.code === "INSUFFICIENT_FUNDS") {
        detailedErrorMessage += "Insufficient funds for transaction";
      } else if (error.code === "UNPREDICTABLE_GAS_LIMIT") {
        detailedErrorMessage += "Unable to estimate gas. Check contract and input.";
      } else if (error.reason) {
        detailedErrorMessage += error.reason;
      } else {
        detailedErrorMessage += error.message || "Unknown error occurred";
      }

      updateSharedState({ errorMessage: detailedErrorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="step3-wrapper">
      {/* Display error message */}
      {sharedState.errorMessage && <div className="error-message">{sharedState.errorMessage}</div>}

      {/* Display transaction processing status */}
      {isLoading ? (
        <p>Processing transaction...</p>
      ) : (
        <button className="send-button" onClick={handleSend} disabled={isLoading}>
          Send Batch Transaction
        </button>
      )}

      {/* Transaction Confirmation Section */}
      {sharedState.txnHash && (
        <div className="txn-confirmation">
          <h1></h1>
          <p>
          View your transaction details on {" "}


          {/* <option value="0xd312f1C56bfe9be58a36C4747a945FC699a9C079">Ethereum Sepolia Testnet</option>
  <option value="0xC09605fe77FfF000979a246b12c6fCaad0E7E722">Polygon Amoy Testnet</option>
  <option value="0x2963ff0196a901ec3F56d7531e7C4Ce8F226462B">Ethereum Mainnet</option> */}


          {sharedState.CONTRACT_ADDRESS == "0xd312f1C56bfe9be58a36C4747a945FC699a9C079" 
          &&
          <a href={`https://sepolia.etherscan.io/tx/${sharedState.txnHash}`}target="_blank" rel="noopener noreferrer" className="etherscan-link">
              Etherscan Sepolia Testnet
          </a>
          }
          {sharedState.CONTRACT_ADDRESS == "0xC09605fe77FfF000979a246b12c6fCaad0E7E722"  &&
          <a href={`https://mumbai.polygonscan.com/tx/${sharedState.txnHash}`}target="_blank" rel="noopener noreferrer" className="etherscan-link">
              Polygonscan Mumbai Testnet
          </a>
          }
          {sharedState.CONTRACT_ADDRESS == "0xA899118f4BCCb62F8c6A37887a4F450D8a4E92E0" &&
           <a href={`https://etherscan.io/tx/${sharedState.txnHash}`}target="_blank" rel="noopener noreferrer" className="etherscan-link">
             Etherscan  Mainet
           </a>
          }

          </p>
          {sharedState.receipt && (
            <div className="receipt-info">
              {/* <h3>Transaction Receipt:</h3> */}
              {/* <pre>{JSON.stringify(sharedState.receipt, null, 2)}</pre> */}
            </div>
          )}
        </div>
      )}
     {downloadLink && <h3 className="h2_class"> Transaction Receipt</h3>}
      {/* Provide download link for the receipt */}
      {downloadLink && (
        <div className="download-section">
          {/* <h3>Download Receipt (CSV)</h3> */}
          <a href={downloadLink} download="transaction_receipt.csv">
            Click here to download the receipt
          </a>
        </div>
      )}

      <div className="back-button-section">
        <button className="back-button" onClick={onBack}>Back</button>
      </div>
    </div>
  );
};

export default Step3;
//0.190104961755563461 ETH
//0.188968901698249566 ETH
//0.001
//0.054652719121936 ETH