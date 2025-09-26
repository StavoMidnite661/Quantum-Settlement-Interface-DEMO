
import { formatUnits, type EventLog, type BrowserProvider } from 'ethers';
import { Payment, PaymentStatus, Priority } from '../types';

/**
 * Parses a raw ethers log for a 'BurnForPurchase' event into our app's Payment type.
 * @param log The event log object from ethers.
 * @param provider An ethers provider to fetch block details.
 * @returns A promise that resolves to a structured Payment object.
 */
export const parsePaymentEvent = async (log: EventLog, provider: BrowserProvider): Promise<Payment> => {
  const block = await provider.getBlock(log.blockNumber);
  const parsedArgs = log.args!;

  const amountInTokens = parseFloat(formatUnits(parsedArgs.amount, 18)); // Assuming 18 decimals

  // Simulate priority since it's not on-chain
  const priorities = [Priority.HIGH, Priority.MEDIUM, Priority.LOW];
  const randomPriority = priorities[Math.floor(Math.random() * priorities.length)];

  const purchaserAddress = String(parsedArgs.purchaser);

  return {
    id: log.transactionHash,
    user: {
      id: purchaserAddress,
      name: `${purchaserAddress.substring(0, 6)}...${purchaserAddress.substring(purchaserAddress.length - 4)}`,
      type: 'Client'
    },
    description: parsedArgs.retailerId,
    payment_type: 'debit',
    amount: {
      amount_in_tokens: amountInTokens,
      // Simulate USD value, e.g., 1 token = $0.01
      amount_in_usd_cents: Math.round(amountInTokens * 1), 
    },
    status: PaymentStatus.SETTLED,
    created_at: new Date(block.timestamp * 1000).toISOString(),
    updated_at: new Date(block.timestamp * 1000).toISOString(),
    settlement_data: {
      status: 'confirmed',
      tx_id: log.transactionHash,
      blockchain_tx_hash: log.transactionHash,
      settled_at: new Date(block.timestamp * 1000).toISOString(),
      notes: [`Confirmed in block #${log.blockNumber}`],
      block_number: log.blockNumber,
    },
    routing_trace: [
      {
        service: 'POSCreditToken Contract',
        action: 'burn_for_purchase',
        timestamp: new Date(block.timestamp * 1000).toISOString(),
        status: 'success',
        details: {
          purchaser: parsedArgs.purchaser,
          amount: parsedArgs.amount.toString(),
          retailerId: parsedArgs.retailerId,
          transactionDataHash: parsedArgs.transactionDataHash,
          optionalComplianceDataHash: parsedArgs.optionalComplianceDataHash,
        },
      },
    ],
    priority: randomPriority,
    transactionDataHash: parsedArgs.transactionDataHash,
    complianceDataHash: parsedArgs.optionalComplianceDataHash,
    isLive: true,
  };
};