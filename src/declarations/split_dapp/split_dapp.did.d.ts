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
  'createEscrow' : ActorMethod<
    [Principal, Array<ParticipantShare>, string],
    undefined
  >,
  'getAdmin' : ActorMethod<[], Principal>,
  'getBalance' : ActorMethod<[Principal], bigint>,
  'getLogs' : ActorMethod<[], Array<string>>,
  'getName' : ActorMethod<[Principal], [] | [string]>,
  'getPending' : ActorMethod<[Principal], Array<PendingTransfer>>,
  'getPendingApprovalsForRecipient' : ActorMethod<
    [Principal],
    Array<Transaction>
  >,
  'getTransactions' : ActorMethod<[Principal], Array<Transaction>>,
  'initiateEscrow' : ActorMethod<[Principal, bigint], undefined>,
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
  'releaseSplit' : ActorMethod<[Principal], Array<ToEntry>>,
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
  'to' : Array<ToEntry>,
  'status' : TransactionStatus,
  'title' : string,
  'from' : Principal,
  'isRead' : boolean,
  'timestamp' : bigint,
}
export type TransactionStatus = { 'cancelled' : null } |
  { 'pending' : null } |
  { 'released' : null } |
  { 'confirmed' : null } |
  { 'declined' : null } |
  { 'draft' : null };
export interface _SERVICE extends SplitDApp {}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
