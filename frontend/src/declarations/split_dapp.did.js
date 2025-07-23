export const idlFactory = ({ IDL }) => {
  const PendingTransfer = IDL.Record({
    'to' : IDL.Principal,
    'name' : IDL.Text,
    'initiatedAt' : IDL.Nat,
    'amount' : IDL.Nat,
  });
  const ToEntry = IDL.Record({
    'principal' : IDL.Principal,
    'name' : IDL.Text,
    'amount' : IDL.Nat,
  });
  const TransactionStatus = IDL.Variant({
    'cancelled' : IDL.Null,
    'pending' : IDL.Null,
    'completed' : IDL.Null,
    'released' : IDL.Null,
  });
  const Transaction = IDL.Record({
    'to' : IDL.Vec(ToEntry),
    'status' : TransactionStatus,
    'from' : IDL.Principal,
    'isRead' : IDL.Bool,
    'timestamp' : IDL.Nat,
  });
  const ParticipantShare = IDL.Record({
    'principal' : IDL.Principal,
    'amount' : IDL.Nat,
  });
  const SplitDApp = IDL.Service({
    'cancelSplit' : IDL.Func([IDL.Principal], [], []),
    'getAdmin' : IDL.Func([], [IDL.Principal], ['query']),
    'getBalance' : IDL.Func([IDL.Principal], [IDL.Nat], ['query']),
    'getLogs' : IDL.Func([], [IDL.Vec(IDL.Text)], ['query']),
    'getName' : IDL.Func([IDL.Principal], [IDL.Opt(IDL.Text)], ['query']),
    'getPending' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(PendingTransfer)],
        ['query'],
      ),
    'getTransactions' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(Transaction)],
        ['query'],
      ),
    'initiateSplit' : IDL.Func(
        [IDL.Principal, IDL.Vec(ParticipantShare)],
        [],
        [],
      ),
    'markTransactionsAsRead' : IDL.Func([IDL.Principal], [], []),
    'releaseSplit' : IDL.Func([IDL.Principal], [IDL.Vec(ToEntry)], []),
    'setInitialBalance' : IDL.Func(
        [IDL.Principal, IDL.Nat, IDL.Principal],
        [],
        [],
      ),
    'setName' : IDL.Func([IDL.Principal, IDL.Text], [], []),
  });
  return SplitDApp;
};
export const init = ({ IDL }) => { return [IDL.Principal]; };
