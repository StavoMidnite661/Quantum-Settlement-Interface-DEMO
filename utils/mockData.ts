import { Payment, PaymentStatus, Priority, User } from '../types';

// Pre-defined set of users for consistency
const mockUsers: User[] = [
    { id: '0x' + crypto.randomUUID().replace(/-/g, '').slice(0,40), name: 'Nexus Dynamics', type: 'Partner' },
    { id: '0x' + crypto.randomUUID().replace(/-/g, '').slice(0,40), name: 'Cygnus Corp', type: 'Client' },
    { id: '0x' + crypto.randomUUID().replace(/-/g, '').slice(0,40), name: 'Stellar Goods', type: 'First Adopter' },
    { id: '0x' + crypto.randomUUID().replace(/-/g, '').slice(0,40), name: 'Orion Merchants', type: 'Client' },
];

const mockDescriptions = ['Retailer ID: A78-2B', 'Retailer ID: C45-9Z', 'Retailer ID: X99-1A', 'Retailer ID: F23-5G'];

const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const generateRandomHash = () => '0x' + crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '').slice(0, 24);

export const generateMockPayment = (isNew: boolean = false): Payment => {
    const status = getRandomElement([PaymentStatus.PENDING, PaymentStatus.PROCESSING, PaymentStatus.SETTLED, PaymentStatus.FAILED, PaymentStatus.CANCELED]);
    const createdAt = new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)); // up to 30 days ago
    
    return {
        id: generateRandomHash(),
        user: getRandomElement(mockUsers),
        description: getRandomElement(mockDescriptions),
        payment_type: 'debit',
        amount: {
            amount_in_tokens: Math.floor(Math.random() * 5000) + 100,
            amount_in_usd_cents: Math.floor(Math.random() * 500000) + 1000,
        },
        status,
        created_at: isNew ? new Date().toISOString() : createdAt.toISOString(),
        updated_at: new Date(createdAt.getTime() + Math.floor(Math.random() * 100000)).toISOString(),
        settlement_data: {
            status: status === PaymentStatus.SETTLED ? 'confirmed' : 'pending',
            tx_id: status === PaymentStatus.SETTLED ? generateRandomHash() : null,
            blockchain_tx_hash: status === PaymentStatus.SETTLED ? generateRandomHash() : null,
            settled_at: status === PaymentStatus.SETTLED ? new Date().toISOString() : null,
            notes: status === PaymentStatus.FAILED ? ['Network congestion timeout'] : [],
            block_number: Math.floor(Math.random() * 1000000) + 18000000,
        },
        routing_trace: [
            { service: 'API Gateway', action: 'receive_payment_request', timestamp: createdAt.toISOString(), status: 'success', details: { ip: '192.168.1.1' } },
            { service: 'Compliance Engine', action: 'verify_transaction', timestamp: new Date(createdAt.getTime() + 1000).toISOString(), status: 'success', details: { check: 'passed' } },
        ],
        priority: getRandomElement([Priority.HIGH, Priority.MEDIUM, Priority.LOW]),
        transactionDataHash: generateRandomHash(),
        complianceDataHash: generateRandomHash(),
        ai_flag: Math.random() > 0.9 ? { reason: 'Unusual transaction amount for this user.' } : undefined,
        isLive: false,
    };
};

export const generateInitialMockData = (count: number): Payment[] => {
    return Array.from({ length: count }, () => generateMockPayment()).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};