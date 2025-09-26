import { Payment, PaymentStatus, Priority, User } from './types';

const users: User[] = [
  { id: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b', name: 'Nexus Dynamics', type: 'First Adopter' },
  { id: '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c', name: 'QuantumLeap Corp', type: 'Partner' },
  { id: '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d', name: 'Stellar Solutions', type: 'Client' },
  { id: '0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e', name: 'Momentum Ventures', type: 'First Adopter' },
];

const generateRandomHash = () => `0x${[...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;

export const MOCK_PAYMENTS: Payment[] = Array.from({ length: 25 }, (_, i) => {
  const user = users[i % users.length];
  const amountTokens = Math.floor(Math.random() * 5000) + 100;
  const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString();
  
  let statusOptions = [PaymentStatus.SETTLED, PaymentStatus.PROCESSING, PaymentStatus.PENDING, PaymentStatus.FAILED];
  // Ensure some failures for Stellar Solutions to trigger AI flag
  if (user.name === 'Stellar Solutions' && i % 2 === 0) {
      statusOptions = [PaymentStatus.FAILED, PaymentStatus.FAILED, PaymentStatus.PENDING];
  }
  const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];

  const txHash = generateRandomHash();
  
  const payment: Payment = {
    id: txHash,
    user,
    description: `Retailer POS-${1000 + i}`,
    payment_type: 'debit',
    amount: {
      amount_in_tokens: amountTokens,
      amount_in_usd_cents: amountTokens * 1, // 1 token = $0.01
    },
    status,
    created_at: createdAt,
    updated_at: createdAt,
    settlement_data: {
      status: status === PaymentStatus.SETTLED ? 'confirmed' : 'pending',
      tx_id: txHash,
      blockchain_tx_hash: status === PaymentStatus.SETTLED ? txHash : null,
      settled_at: status === PaymentStatus.SETTLED ? createdAt : null,
      notes: status === PaymentStatus.FAILED ? ['Blockchain transaction reverted: Insufficient gas.'] : [`Confirmed in block #${18000000 + i}`],
      block_number: 18000000 + i,
    },
    routing_trace: [
      {
        service: 'Payment Gateway',
        action: 'initiate_transaction',
        timestamp: new Date(new Date(createdAt).getTime() - 2000).toISOString(),
        status: 'success',
        details: { amount: amountTokens, userId: user.id },
      },
      ...(status !== PaymentStatus.PENDING ? [{
        service: 'Settlement Protocol',
        action: 'submit_to_blockchain',
        timestamp: new Date(new Date(createdAt).getTime() - 1000).toISOString(),
        status: status === PaymentStatus.FAILED ? 'failure' as const : 'success' as const,
        details: { gasPrice: '50 Gwei', txHashPreview: txHash.slice(0, 20) + '...' },
      }] : []),
    ],
    priority: [Priority.HIGH, Priority.MEDIUM, Priority.LOW][i % 3],
    transactionDataHash: generateRandomHash(),
    complianceDataHash: generateRandomHash(),
  };

  // Add an AI flag for repeated failures
  if (user.name === 'Stellar Solutions' && status === PaymentStatus.FAILED) {
      payment.ai_flag = {
          reason: "Anomalous Activity: High rate of transaction failures detected for this user. Potential wallet or integration issue."
      }
  }

  return payment;
});