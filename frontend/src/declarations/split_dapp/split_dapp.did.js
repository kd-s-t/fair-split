export const idlFactory = ({ IDL }) => {
  const ToEntry = IDL.Record({
    'principal' : IDL.Principal,
    'name' : IDL.Text,
    'amount' : IDL.Nat,
  });
  const Transaction = IDL.Record({
    'to' : IDL.Vec(ToEntry),
    'from' : IDL.Principal,
    'isRead' : IDL.Bool,
    'timestamp' : IDL.Nat,
  });
  const ParticipantShare = IDL.Record({
    'principal' : IDL.Principal,
    'amount' : IDL.Nat,
  });
  const SplitRecord = IDL.Record({
    'participant' : IDL.Principal,
    'share' : IDL.Nat,
  });
  const SplitDApp = IDL.Service({
    'getAdmin' : IDL.Func([], [IDL.Principal], ['query']),
    'getBalance' : IDL.Func([IDL.Principal], [IDL.Nat], ['query']),
    'getLogs' : IDL.Func([], [IDL.Vec(IDL.Text)], ['query']),
    'getName' : IDL.Func([IDL.Principal], [IDL.Opt(IDL.Text)], ['query']),
    'getTransactions' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(Transaction)],
        ['query'],
      ),
    'markTransactionsAsRead' : IDL.Func([IDL.Principal], [], []),
    'setInitialBalance' : IDL.Func(
        [IDL.Principal, IDL.Nat, IDL.Principal],
        [],
        [],
      ),
    'setName' : IDL.Func([IDL.Principal, IDL.Text], [], []),
    'splitBill' : IDL.Func(
        [
          IDL.Record({ 'participants' : IDL.Vec(ParticipantShare) }),
          IDL.Principal,
        ],
        [IDL.Vec(SplitRecord)],
        [],
      ),
  });
  return SplitDApp;
};
export const init = ({ IDL }) => { return [IDL.Principal]; };
