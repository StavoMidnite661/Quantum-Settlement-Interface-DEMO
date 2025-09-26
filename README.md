# SOVR Empire QSI: User Manual

## 1. Introduction

Welcome to the SOVR Empire Quantum Settlement Interface (QSI).

The QSI is a sophisticated, high-fidelity dashboard that serves as a **middleware monitoring tool** for direct-to-blockchain payment protocols. It is designed for operators and businesses who need targeted, real-time visibility into their portfolio of deployed smart contracts. This interface provides a high-level overview of transaction states, enabling efficient monitoring and interaction with the underlying payment protocol.

This manual will guide you through all the features of the QSI and help you get started with monitoring live on-chain activity.

---

## 2. Getting Started: Wallet Connection

To interact with the blockchain and monitor contracts, you must first connect a Web3 wallet.

1.  **Install a Wallet:** Ensure you have a browser-based Ethereum wallet like MetaMask, Rabby, or Frame installed.
2.  **Connect:** Click the **"Connect Wallet"** button in the top-right corner of the header.
3.  **Approve Connection:** Your wallet extension will prompt you to approve the connection. Once approved, your wallet address will be displayed, and a green light will indicate a successful connection.

The application is now ready to interact with the blockchain.

---

## 3. The Settlement Dashboard

The dashboard is your main command center for monitoring payments. Upon first launch, it will be empty. Data will populate in real-time as you begin monitoring contracts.

### 3.1. Dashboard Components

-   **Settlement Overview:** At the top, you'll find key statistics: Total transactions, Pending, Processing, Settled, and Failed. A progress bar visualizes the percentage of settled transactions.
-   **AI Sentinel:** An integrated AI analyst that provides automated insights and allows you to ask natural language questions about the transaction data.
-   **Live Contract Listener:** A targeted tool to listen for specific `BurnForPurchase` events from one or more smart contracts.
-   **Filter & Search Controls:** A powerful set of tools to refine the list of displayed payments.
-   **Payments Grid:** The main area where individual payment cards are displayed.

### 3.2. Monitoring Live Payments (`BurnForPurchase` Events)

The "Live Contract Listener" is designed to parse specific payment events from your contracts and display them as structured payment cards on the dashboard.

1.  **Navigate** to the "Live Contract Listener" section on the dashboard.
2.  **Enter Contract Addresses:** In the input field, paste the Ethereum address(es) of the smart contracts you wish to monitor. If you have multiple, separate them with commas.
3.  **Start Listening:** Click the **"Start Listening"** button.
4.  **Observe:** The listener is now active. When any of the specified contracts emit a `BurnForPurchase` event, it will be automatically parsed and will appear as a new card in the payments grid below. The card will be marked with a "Live" tag.

To stop monitoring, simply click the **"Stop Listening"** button.

### 3.3. Interacting with Payments

-   **Filtering:** Use the buttons (`All`, `Pending`, `Settled`, etc.) to filter the payments grid by status.
-   **Sorting:** Use the dropdown to sort payments by "Newest" or by "Priority".
-   **Searching:** Use the search bar to find specific payments by User Name, Retailer ID, Transaction Hash, or User Address.
-   **Viewing Details:** Click on any payment card to open a detailed modal view. This view includes all transaction parameters, data hashes, and an expandable routing trace that shows the journey of the payment.
-   **Exporting Data:** Click the **"Export"** button to download a `.csv` file of the payments currently visible (respecting any active filters and search terms).

### 3.4. Using the AI Sentinel

The AI Sentinel helps you make sense of the data quickly.

1.  **Initial Analysis:** Upon loading, the AI provides an initial summary of any anomalies or important data points it detects.
2.  **Ask Questions:** Use the input box at the bottom of the AI Sentinel panel to ask questions in plain English. For example:
    -   *"Which user has the most failed transactions?"*
    -   *"Summarize the activity for Nexus Dynamics."*
    -   *"What is the total value of settled transactions?"*

The AI will analyze the current dataset on the dashboard and provide a concise answer.

---

## 4. Monitored Contracts (Generic Event Feed)

While the dashboard is specialized for payment events, the "Monitored Contracts" tab provides a powerful, generic event listener for *any* event from *any* smart contract. This is ideal for developers and operators who need to debug or monitor a wider range of contract activities.

### 4.1. Adding a Contract

1.  **Navigate** to the "Monitored Contracts" tab.
2.  **Fill in the Form:**
    -   **Friendly Name:** A name for you to easily identify the contract (e.g., "Treasury V2").
    -   **Network RPC URL:** The RPC endpoint for the network the contract is on (e.g., from Alchemy, Infura, or a public RPC).
    -   **Contract Address:** The `0x...` address of the smart contract.
    -   **Contract ABI:** The full Application Binary Interface (ABI) of the contract, in JSON format. This is required to decode the event data.
3.  **Add & Monitor:** Click the **"Add & Monitor Contract"** button.

The contract will now appear in the "Currently Monitored" list. The application will immediately start listening for events.

### 4.2. The Live Event Feed

-   **Real-Time Updates:** As soon as any event is emitted by any of your monitored contracts, it will appear at the top of the "Live Event Feed" on the right.
-   **View Event Data:** Each event card shows the contract name, event name, and timestamp. You can click "Show Data" to expand the view and see the full, decoded event arguments.
-   **Etherscan Link:** Click the transaction hash to view the transaction directly on a block explorer like Etherscan.

### 4.3. Managing Contracts

To remove a contract from the monitoring list, simply click the trash can icon next to its name in the "Currently Monitored" list. The application will stop listening for its events. Your list of monitored contracts is saved in your browser's local storage, so it will persist between sessions.

---

## 5. User Profiles

The QSI automatically aggregates transactions by user.

1.  **Accessing a Profile:** On the Settlement Dashboard, click on a user's name on any payment card.
2.  **Viewing History:** You will be taken to a dedicated profile page that shows the user's name and address, along with a complete, sortable table of all their transactions recorded in the dashboard.
3.  **Sorting Transactions:** Click on the headers of the transaction table (e.g., "Timestamp", "Amount") to sort the user's entire history.
4.  **Return to Dashboard:** Click the "Back to Dashboard" button to return to the main view.

---
