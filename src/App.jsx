import React, { useState, useEffect } from "react";
import Step1 from "./Components/Step1/Step1";
import Step2 from "./Components/Step2/Step2";
import Step3 from "./Components/Step3/Step3";
// import Footer from "./Components/Footer";
import "./App.css";
import { ethers } from "ethers";

const App = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [sharedState, setSharedState] = useState({
    walletAddress: "",
    addresses: [],
    amounts: [],
    selectedToken: "META",
    customTokenAddress: "",
    totalAmount: "0",
    estimatedGas: null,
    receipt: null,
    txnHash: null,
    errorMessage: "",
    custom_token_balance:"0",
    custom_token_symbol:"ERC20",
    token_balance:"0",
    provider: null,
    signer: null,
    contract: null,
    ethBalance: null,
    CONTRACT_ADDRESS:"0x41c108bba45ffc0ceee17a1dabaddd738bd3ab43", 
    approved_i:false,
  });

  const [fucet_txn_hash, set_faucet_txn_hash] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFaucetModalOpen, setFaucetModalOpen] = useState(false);

  const handleFaucetClick = () => {
    setFaucetModalOpen(true);
  };

  const closeFaucetModal = () => {
    setFaucetModalOpen(false);
  }



  useEffect(() => {
    balance_func();
    checkAndSwitchToSepolia();
  }, [isFaucetModalOpen]);
  

let balance_func =async()=>
{
  const contract = new ethers.Contract("0xd312f1C56bfe9be58a36C4747a945FC699a9C079" , [
    "function balanceOf(address) view returns (uint256)"
  ], sharedState.signer);

  let balance = await contract.balanceOf(sharedState.walletAddress);// Update the MetaToken balance after minting
  // console.log("balance=",balance.toString());
  setSharedState((prevState) => ({...prevState,token_balance: ethers.utils.formatUnits(balance, 18)}));
}


  const mintMetaToken = async () => {
    try 
    {
        setIsLoading(true);
      // if (sharedState.contractAddress) {
        const contract = new ethers.Contract("0xd312f1C56bfe9be58a36C4747a945FC699a9C079" , [
          "function faucet() external",
        ], sharedState.signer);
        
        let tx =await contract.faucet( { gasLimit: 210000 }); // Call the faucet function
        await tx.wait(); // Wait for the transaction to be mined
        set_faucet_txn_hash(tx.hash);
        console.log("Tokens minted successfully!");
        console.log("Transaction hash:", tx.hash);
        setFaucetModalOpen(false); // Close the modal after minting
      
    } 
    catch (error) 
    {
      console.error("Error minting tokens:", error);
    }
    finally
    {setIsLoading(false);}
  };

  const updateSharedState = (updates) => {
    setSharedState(prevState => ({
      ...prevState,
      ...updates
    }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };


  const checkAndSwitchToSepolia = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.error("Metamask is not installed.");
        return;
      }
  
      const provider = new ethers.providers.Web3Provider(ethereum);
      const network = await provider.getNetwork();
  
      // Check if the network is Sepolia (chainId: 11155111)
      if (network.chainId !== 11155111) {
        try {
          await ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0xAA36A7" }], // Hexadecimal for 11155111
          });
          console.log("Switched to Sepolia network");
        } catch (error) {
          // If the user doesn't have Sepolia, try adding it
          if (error.code === 4902) {
            try {
              await ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: "0xAA36A7",
                    chainName: "Sepolia Testnet",
                    nativeCurrency: {
                      name: "Sepolia ETH",
                      symbol: "ETH",
                      decimals: 18,
                    },
                    rpcUrls: ["https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID"],
                    blockExplorerUrls: ["https://sepolia.etherscan.io"],
                  },
                ],
              });
              console.log("Sepolia network added and switched to it.");
            } catch (addError) {
              console.error("Error adding Sepolia network:", addError);
            }
          } else {
            console.error("Error switching network:", error);
          }
        }
      }
    } catch (error) {
      console.error("Error checking or switching network:", error);
    }
  };




  return (
    <>
    <div className="step-container">
      <h1>Welcome to Metaschool Token MultiSender </h1>
      
      <div className="steps">
        <div className={`step ${currentStep === 1 ? 'active' : ''}`}>
          <span className="step-number">1</span> Prepare
        </div>
        <div className={`step ${currentStep === 2 ? 'active' : ''}`}>
          <span className="step-number">2</span> {sharedState.selectedToken === "ETH" ? "Confirm" : "Approve"}
        </div>
        <div className={`step ${currentStep === 3 ? 'active' : ''}`}>
          <span className="step-number">3</span> Send
        </div>
      </div>
      <div className="step-content">
        {currentStep === 1 && (
          <Step1 
            sharedState={sharedState} 
            updateSharedState={updateSharedState} 
            onNext={handleNext}
          />
        )}
        {currentStep === 2 && (
          <Step2 
            sharedState={sharedState} 
            updateSharedState={updateSharedState} 
            onNext={handleNext} 
            onBack={handleBack}
          />
        )}
        {currentStep === 3 && (
          <Step3 
            sharedState={sharedState} 
            updateSharedState={updateSharedState}
            onBack={handleBack}
          />
        )}
      </div>
      
    </div>


    <div className="faucet-container" onClick={handleFaucetClick}>
        <button>Faucet</button>
      </div>

      {isFaucetModalOpen && (
        <>
          <div className="overlay" onClick={closeFaucetModal}></div>
          <div className="modal">
            <div className="modal-content">
              <h2>MetaToken Faucet</h2>
              <p>Fast and reliable. 10 Meta / 24 hrs.</p>
              
              <h1></h1>
              
              
              <p>Your current balance: {sharedState.token_balance} META</p>
              <div className="space"></div>
              {isLoading ? <p>Processing transaction...</p> : null}
              <button onClick={mintMetaToken}>Mint 10 META</button>
              <button onClick={closeFaucetModal}>Close</button>
              <div className="space"></div>
              <p>
                <b>Note :</b>The faucet is currently available only on the Sepolia Testnet.
              </p>
            </div>
          </div>
        </>
      )}


    {/* <Footer></Footer> */}
    </>
   
  );
};

export default App;