import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface SplitDApp {
  'getAdmin' : ActorMethod<[], Principal>,
  'getBalance' : ActorMethod<[Principal], bigint>,
  'getLogs' : ActorMethod<[], Array<string>>,
  'getName' : ActorMethod<[Principal], [] | [string]>,
  'getTransactions' : ActorMethod<[Principal], Array<Transaction>>,
  'setInitialBalance' : ActorMethod<[Principal, bigint, Principal], undefined>,
  'setName' : ActorMethod<[Principal, string], undefined>,
  'splitBill' : ActorMethod<
    [{ 'participants' : Array<Principal>, 'total' : bigint }, Principal],
    Array<SplitRecord>
  >,
}
export interface SplitRecord { 'participant' : Principal, 'share' : bigint }
export interface Transaction {
  'to' : Principal,
  'from' : Principal,
  'timestamp' : bigint,
  'amount' : bigint,
}
export interface _SERVICE extends SplitDApp {}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
