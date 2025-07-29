import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface ParticipantShare { 'principal' : Principal, 'amount' : bigint }
export interface PendingTransfer {
  'to' : Principal,
  'name' : string,
  'initiatedAt' : bigint,
  'amount' : bigint,
}
export interface SplitDApp {
  'cancelEscrow' : ActorMethod<[Principal, bigint], undefined>,
  'cancelSplit' : ActorMethod<[Principal], undefined>,
  'getAdmin' : ActorMethod<[], Principal>,
  'getBalance' : ActorMethod<[Principal], bigint>,
  'getLogs' : ActorMethod<[], Array<string>>,
  'getName' : ActorMethod<[Principal], [] | [string]>,
  'getPending' : ActorMethod<[Principal], Array<PendingTransfer>>,
  'getPendingApprovalsForRecipient' : ActorMethod<
    [Principal],
    Array<Transaction>
  >,
  'getTransaction' : ActorMethod<[string, Principal], [] | [Transaction]>,
  'getTransactions' : ActorMethod<[Principal], Array<Transaction>>,
  'getTransactionsPaginated' : ActorMethod<
    [Principal, bigint, bigint],
    {
      'totalCount' : bigint,
      'totalPages' : bigint,
      'transactions' : Array<Transaction>,
    }
  >,
  'initiateEscrow' : ActorMethod<
    [Principal, Array<ParticipantShare>, string],
    string
  >,
  'initiateSplit' : ActorMethod<
    [Principal, Array<ParticipantShare>, string],
    undefined
  >,
  'markTransactionsAsRead' : ActorMethod<[Principal], undefined>,
  'recipientApproveEscrow' : ActorMethod<
    [Principal, bigint, Principal],
    undefined
  >,
  'recipientDeclineEscrow' : ActorMethod<
    [Principal, bigint, Principal],
    undefined
  >,
  'releaseEscrow' : ActorMethod<[Principal, bigint], undefined>,
  'releaseSplit' : ActorMethod<[Principal, string], undefined>,
  'setInitialBalance' : ActorMethod<[Principal, bigint, Principal], undefined>,
  'setName' : ActorMethod<[Principal, string], undefined>,
}
export interface ToEntry {
  'status' : { 'pending' : null } |
    { 'approved' : null } |
    { 'declined' : null },
  'principal' : Principal,
  'name' : string,
  'amount' : bigint,
}
export interface Transaction {
  'id' : string,
  'to' : Array<ToEntry>,
  'status' : TransactionStatus,
  'title' : string,
  'from' : Principal,
  'isRead' : boolean,
  'timestamp' : bigint,
  'releasedAt' : [] | [bigint],
}
export type TransactionStatus = string;
export interface _SERVICE extends SplitDApp {}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
