import { Recipient } from "./Recipient";

type TransactionStatus = 'active' | 'completed' | 'pending' | 'refunded';
type TransactionCategory = 'sent' | 'received';

export interface Transaction {
    description: string;
    amount: string;
    status: TransactionStatus;
    recipients: Recipient[];
    date?: string;
}