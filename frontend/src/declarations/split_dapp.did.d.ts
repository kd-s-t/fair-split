import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface SplitDApp {
  'getAdmin' : ActorMethod<[], Principal>,
  'getLogs' : ActorMethod<[], Array<string>>,
  'splitBill' : ActorMethod<
    [{ 'participants' : Array<Principal>, 'total' : bigint }, Principal],
    Array<SplitRecord>
  >,
}
export interface SplitRecord { 'participant' : Principal, 'share' : bigint }
export interface _SERVICE extends SplitDApp {}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
