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
  'cancelSplit' : ActorMethod<[Principal], undefined>,
  'getAdmin' : ActorMethod<[], Principal>,
  'getBalance' : ActorMethod<[Principal], bigint>,
  'getLogs' : ActorMethod<[], Array<string>>,
  'getName' : ActorMethod<[Principal], [] | [string]>,
  'getPending' : ActorMethod<[Principal], Array<PendingTransfer>>,
  'getTransactions' : ActorMethod<[Principal], Array<Transaction>>,
  'initiateSplit' : ActorMethod<
    [Principal, Array<ParticipantShare>],
    undefined
  >,
  'markTransactionsAsRead' : ActorMethod<[Principal], undefined>,
  'releaseSplit' : ActorMethod<[Principal], Array<ToEntry>>,
  'setInitialBalance' : ActorMethod<[Principal, bigint, Principal], undefined>,
  'setName' : ActorMethod<[Principal, string], undefined>,
}
export interface ToEntry {
  'principal' : Principal,
  'name' : string,
  'amount' : bigint,
}
export interface Transaction {
  'to' : Array<ToEntry>,
  'status' : TransactionStatus,
  'from' : Principal,
  'isRead' : boolean,
  'timestamp' : bigint,
}
export type TransactionStatus = { 'cancelled' : null } |
  { 'pending' : null } |
  { 'completed' : null } |
  { 'released' : null };
export interface _SERVICE extends SplitDApp {}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
