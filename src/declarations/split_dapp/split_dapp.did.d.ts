import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface ParticipantShare { 'principal' : Principal, 'amount' : bigint }
export interface SplitDApp {
  'getAdmin' : ActorMethod<[], Principal>,
  'getBalance' : ActorMethod<[Principal], bigint>,
  'getLogs' : ActorMethod<[], Array<string>>,
  'getName' : ActorMethod<[Principal], [] | [string]>,
  'getTransactions' : ActorMethod<[Principal], Array<Transaction>>,
  'markTransactionsAsRead' : ActorMethod<[Principal], undefined>,
  'setInitialBalance' : ActorMethod<[Principal, bigint, Principal], undefined>,
  'setName' : ActorMethod<[Principal, string], undefined>,
  'splitBill' : ActorMethod<
    [{ 'participants' : Array<ParticipantShare> }, Principal],
    Array<SplitRecord>
  >,
}
export interface SplitRecord { 'participant' : Principal, 'share' : bigint }
export interface ToEntry {
  'principal' : Principal,
  'name' : string,
  'amount' : bigint,
}
export interface Transaction {
  'to' : Array<ToEntry>,
  'from' : Principal,
  'isRead' : boolean,
  'timestamp' : bigint,
}
export interface _SERVICE extends SplitDApp {}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
