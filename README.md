# Token MultiSender

Token MultiSender is a decentralized application that allows users to send tokens to multiple addresses in bulk efficiently and securely.

Built with React.js and styled with Tailwind CSS, this applicationn allow user to send tokens to multiple addresses in a single transaction, saving time and reducing gas fees.
## Features

- **Bulk Token Transfers:** Upload a file (Excel, CSV, or Txt) or manually input recipient addresses with token amounts.
- **Custom Token Support:** Add custom tokens by pasting their contract address.
- **Transaction Summary:** Review and confirm transaction details before proceeding.
- **Real-time Feedback:** See token balances and transaction status in real-time.
- **User-friendly Interface:** Intuitive steps to guide users through the process.


## Tech-Stack
- **Frontend:** React.js
- **Backend:** Node.js
- **Blockchain:** Ethereum, Solidity
- **Utilities:** Web3.js, Ethers.js



### Installation Steps
1. Clone the repository:
    ```bash
    git clone https://github.com/0xmetaschool/token-multisender.git
    ```
2. Install Dependencies: Navigate to the project directory and install the necessary dependencies:
    ```bash
    cd token-multisender
    npm install --y
    ```
    
4. Start the Development Server: Run the following command to launch the app locally:
    ```bash
    npm run dev
    ```

## Screenshots

<table>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/71e3860e-030e-42e5-b5f6-46f43f2219cb" alt="Screenshot 1" width="350"></td>
    <td><img src="https://github.com/user-attachments/assets/4a18f298-1593-4a7b-bc44-54afc921be86" alt="Screenshot 2" width="350"></td>
    <td><img src="https://github.com/user-attachments/assets/78ba4528-548f-4293-b6ee-84f2fc9786ed" alt="Screenshot 3" width="350"></td>
    <td><img src="https://github.com/user-attachments/assets/9d491640-5205-4047-a3ae-808447f98408" alt="Screenshot 4" width="350"></td>
  </tr>
</table>

## How to use Mulisender

### **Step 1: Prepare**
1. Connect your wallet and select the **Ethereum Mainnet**.
2. Wait for token balances to load. If tokens fail to load:
   - Manually insert the token address to add them.
3. Select the token you want to send.
4. Upload an **Excel**, **CSV**, or **Txt** file with addresses and amounts or manually insert them separated by commas.
5. Click **Next** to proceed.



### **Step 2: Confirm**
1. Review the list of recipients:
   - Addresses and corresponding amounts are displayed.
   - Option to **Remove** any recipient from the list.
2. Review the transaction summary:
   - **Total Addresses**: Number of recipients.
   - **Total Tokens to Send**: Amount of tokens.
   - **Total Transactions**: Number of batches needed.
   - **Your Balance**: Current wallet token balance.
   - **Estimated Operation Cost**: Gas fees in Wei.
3. Click **Back** to make changes or **Next** to proceed.


### **Step 3: Send**
1. Confirm the batch transaction details.
2. View your transaction details on **Etherscan** after sending.
3. Option to **Download Receipt** for record-keeping.
4. Wait for the transaction to complete and check the receipt for confirmation.



## Contributing

We welcome contributions to enhance the functionality and user experience of MetaSchool Token MultiSender. 

### Steps to Contribute:
1. Fork the repository.
2. Create a new branch for your feature (`git checkout -b feature_name`).
3. Commit your changes (`git commit -m "Add feature_name"`).
4. Push the changes to your fork (`git push origin feature_name`).
5. Open a pull request to the main repository.



## Contact

For any questions or support, open an issue in the [GitHub repository](https://github.com/0xmetaschool/token-multisender/issues).

