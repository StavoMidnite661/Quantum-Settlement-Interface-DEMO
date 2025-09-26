# SOVR Empire QSI - Quantum Settlement Interface

## 1. Description

The SOVR Empire QSI is a sophisticated, high-fidelity dashboard that serves as a **middleware monitoring tool** for direct-to-blockchain payment protocols. It is designed for operators and businesses who need targeted, real-time visibility into their own portfolio of deployed smart contracts.

This application uses a detailed set of mock data to create a realistic simulation environment for its "Settlement Dashboard". In addition, its "Monitored Contracts" feature allows it to connect to any EVM-compatible blockchain network to listen for live, real-time transactions. This hybrid approach makes it a powerful proof-of-concept and a practical monitoring tool for stakeholders, partners, and operators, showcasing the clarity and efficiency of a blockchain-based settlement system.

---

## 2. Core Features & Functions

- **High-Fidelity Settlement Simulation:**
    - **Realistic Data:** The "Settlement Dashboard" is powered by a comprehensive set of mock data that includes various transaction statuses (`Pending`, `Processing`, `Settled`, `Failed`), priorities, and detailed user profiles.
    - **Real-Time Updates:** A built-in simulator dynamically updates the status of mock payments, mimicking the lifecycle of a transaction as it progresses through a settlement protocol.
- **Multi-Contract Monitoring (Middleware):**
    - **Dedicated Management UI:** A separate "Monitored Contracts" tab allows users to add their own smart contracts by providing a name, network RPC URL, address, and ABI.
    - **Real-Time Generic Event Feed:** The system listens for *all* events from all registered contracts and displays them in an aggregated, real-time feed.
    - **Persistence:** Monitored contracts are saved in the browser's local storage, so your configuration persists across sessions.
- **Corporate & First-Adopter Profiles:**
    - The simulation includes profiles for different types of users, such as "First Adopters" and "Partners," showcasing how the system can cater to a corporate environment.
    - A dedicated profile page displays a complete, sortable transaction history for each company.
- **AI Sentinel:**
    - **Proactive Insights:** An integrated AI analyst (powered by the Gemini API) provides an initial summary of anomalies and important data points on the Settlement Dashboard.
    - **Conversational Analysis:** Users can ask natural language questions about the settlement data to get concise, insightful answers from the AI.
- **Interactive Dashboard:**
    - **Live Overview:** At-a-glance statistics for total payments, broken down by their current status.
    - **Advanced Filtering & Sorting:** Users can filter transactions by status and sort by date or priority level.
    - **Dynamic Search:** A powerful search bar allows finding specific payments by company name, description, user ID, or transaction hash.
- **Detailed Transaction View:**
    - A clickable modal for each payment provides an in-depth summary, including amounts, timestamps, and data hashes.
    - **Expandable Routing Trace:** The modal includes a detailed trace that simulates the journey of a payment through different services.
- **CSV Data Export:**
    - The currently filtered and searched list of payments can be instantly exported to a `.csv` file for offline analysis or reporting.
- **Responsive Design:**
    - The interface is fully responsive, providing a seamless experience on both desktop and mobile devices.

---

## 3. Purpose

The primary purpose of this application is to serve as a **middleware tool that translates raw blockchain events into a business-friendly, actionable UI.** It demonstrates the power and transparency of a direct-to-blockchain system in a controlled, accessible environment.

- **For Business Operators:** It provides a single pane of glass to monitor a portfolio of deployed contracts across different networks in real-time.
- **For Business Development & Sales:** It serves as a compelling, interactive demo for potential clients and partners, clearly illustrating the protocol's features and benefits.
- **For Stakeholders & Investors:** It offers a clear and accessible window into the intended functionality and vision of the payment system.

---

## 4. Installation and Setup

This is a frontend-only application that runs entirely in the browser. To run it locally, follow these steps.

### Prerequisites

1.  **Node.js and npm:** Ensure you have Node.js (v16 or higher) and npm installed.
2.  **Web Browser with Wallet:** A modern web browser like Chrome, Firefox, or Brave with a Web3 wallet extension (e.g., MetaMask) installed.

### Local Development Setup

1.  **Clone the Repository:**
    ```bash
    git clone <your-repository-url>
    cd <repository-folder>
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```
    
3.  **(Optional) Configure AI Sentinel:**
    To enable the AI Sentinel, you need a Gemini API key. Create a `.env.local` file in the project root and add your key:
    ```
    VITE_API_KEY=your_gemini_api_key_here
    ```
    *Note: The app is configured to read this, but due to the no-bundler environment, you may need to ensure your local dev server makes this variable available to `process.env`.*

4.  **Start the Development Server:**
    *(This command assumes a standard Vite or Create React App setup. If your project uses a different command, update accordingly.)*
    ```bash
    npm run dev
    ```

5.  **Open the Application:**
    Open your browser and navigate to the local address provided by the development server (e.g., `http://localhost:5173`).

---

## 5. How to Use the Application

1.  **Explore the Settlement Dashboard:** The app loads on this tab by default. Observe the simulated data and interact with its features (Filter, Sort, Search, AI Sentinel, etc.).
2.  **Switch to Monitored Contracts:**
    - Click the **"Monitored Contracts"** tab in the header.
    - Click **"Connect Wallet"** and approve the connection in MetaMask.
3.  **Add a Contract to Monitor:**
    - Fill in the form with a friendly **Name**, the **Network RPC URL** (e.g., from Infura or Alchemy), the **Contract Address**, and the contract's **ABI** (in JSON format).
    - Click **"Add & Monitor Contract"**.
    - The contract will appear in the "Currently Monitored Contracts" list and the system will start listening for events.
4.  **Observe the Live Event Feed:**
    - When any event is emitted by a monitored contract on-chain, it will appear in the "Live Event Feed" in real-time.
    - You can view the decoded event data and click the transaction hash to view it on Etherscan.
5.  **Interact with AI Sentinel:**
    - On the Settlement Dashboard, read the initial analysis provided by the AI.
    - Ask questions in the input box, such as "Which user has the most failed transactions?" or "Summarize the activity for Nexus Dynamics."