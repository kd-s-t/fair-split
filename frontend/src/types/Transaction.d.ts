import { Recipient } from "./Recipient";

type TransactionStatus = 'active' | 'completed';

export interface Transaction {
    description: string;
    amount: string;
    status: TransactionStatus;
    recipients: Recipient[];
    date?: string;
}