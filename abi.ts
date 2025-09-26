// This file contains the Application Binary Interface (ABI) for the smart contract events
// that the application interacts with. Using a separate file for this is a good practice
// for keeping contract-specific details organized.

/**
 * ABI for the 'BurnForPurchase' event from the POSCreditToken contract.
 * This is a human-readable ABI fragment, which is a concise way to define
 * the event signature for use with ethers.js.
 */
export const POS_CREDIT_TOKEN_ABI = [
  "event BurnForPurchase(address indexed purchaser, uint256 amount, string retailerId, bytes32 transactionDataHash, bytes32 optionalComplianceDataHash)"
];
