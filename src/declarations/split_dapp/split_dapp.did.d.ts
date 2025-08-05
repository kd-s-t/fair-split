import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface FraudActivity {
  'activityType' : string,
  'timestamp' : bigint,
  'transactionId' : string,
}
export interface ParticipantShare {
  'principal' : Principal,
  'nickname' : string,
  'bitcoinAddress' : [] | [string],
  'amount' : bigint,
  'percentage' : bigint,
}
export interface SplitDApp {
  'addBitcoinBalance' : ActorMethod<[Principal, Principal, bigint], boolean>,
  'canUserCreateEscrow' : ActorMethod<[Principal], boolean>,
  'cancelSplit' : ActorMethod<[Principal], undefined>,
  'convertIcpToBitcoin' : ActorMethod<[Principal, Principal, bigint], boolean>,
  'getAdmin' : ActorMethod<[], Principal>,
  'getAllNicknames' : ActorMethod<[], Array<[Principal, string]>>,
  'getBalance' : ActorMethod<[Principal], bigint>,
  'getBitcoinAddress' : ActorMethod<[Principal], [] | [string]>,
  'getCustomNickname' : ActorMethod<[Principal], [] | [string]>,
  'getFraudHistory' : ActorMethod<[Principal], Array<FraudActivity>>,
  'getNickname' : ActorMethod<[Principal], [] | [string]>,
  'getReputationStats' : ActorMethod<
    [Principal],
    {
      'fraudCount' : bigint,
      'canCreateEscrow' : boolean,
      'reputation' : bigint,
      'isFlagged' : boolean,
    }
  >,
  'getTransaction' : ActorMethod<[string, Principal], [] | [Transaction]>,
  'getTransactionsPaginated' : ActorMethod<
    [Principal, bigint, bigint],
    {
      'totalCount' : bigint,
      'totalPages' : bigint,
      'transactions' : Array<Transaction>,
    }
  >,
  'getUserBitcoinBalance' : ActorMethod<[Principal], bigint>,
  'getUserReputationScore' : ActorMethod<[Principal], bigint>,
  'initiateEscrow' : ActorMethod<
    [Principal, Array<ParticipantShare>, string],
    string
  >,
  'isUserFlaggedForFraud' : ActorMethod<[Principal], boolean>,
  'markTransactionsAsRead' : ActorMethod<[Principal], undefined>,
  'recipientApproveEscrow' : ActorMethod<
    [Principal, string, Principal],
    undefined
  >,
  'recipientDeclineEscrow' : ActorMethod<
    [Principal, bigint, Principal],
    undefined
  >,
  'recipientMarkAsReadBatch' : ActorMethod<
    [Array<string>, Principal],
    undefined
  >,
  'refundSplit' : ActorMethod<[Principal], undefined>,
  'releaseSplit' : ActorMethod<[Principal, string], undefined>,
  'removeBitcoinAddress' : ActorMethod<[Principal], boolean>,
  'removeNickname' : ActorMethod<[Principal], undefined>,
  'resetUserReputation' : ActorMethod<[Principal, Principal], undefined>,
  'setBitcoinAddress' : ActorMethod<[Principal, string], boolean>,
  'setBitcoinBalance' : ActorMethod<[Principal, Principal, bigint], boolean>,
  'setCustomNickname' : ActorMethod<[Principal, string], undefined>,
  'setInitialBalance' : ActorMethod<[Principal, bigint, Principal], undefined>,
  'setNickname' : ActorMethod<[Principal, string], undefined>,
  'updateEscrow' : ActorMethod<
    [Principal, string, Array<ParticipantShare>],
    undefined
  >,
}
export interface ToEntry {
  'status' : { 'pending' : null } |
    { 'approved' : null } |
    { 'noaction' : null } |
    { 'declined' : null },
  'principal' : Principal,
  'approvedAt' : [] | [bigint],
  'name' : string,
  'declinedAt' : [] | [bigint],
  'bitcoinAddress' : [] | [string],
  'amount' : bigint,
  'percentage' : bigint,
  'readAt' : [] | [bigint],
}
export interface Transaction {
  'id' : string,
  'to' : Array<ToEntry>,
  'status' : TransactionStatus,
  'title' : string,
  'from' : Principal,
  'createdAt' : bigint,
  'confirmedAt' : [] | [bigint],
  'refundedAt' : [] | [bigint],
  'cancelledAt' : [] | [bigint],
  'bitcoinTransactionHash' : [] | [string],
  'bitcoinAddress' : [] | [string],
  'releasedAt' : [] | [bigint],
  'readAt' : [] | [bigint],
}
export type TransactionStatus = string;
export interface _SERVICE extends SplitDApp {}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
