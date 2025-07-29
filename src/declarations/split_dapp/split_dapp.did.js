export const idlFactory = ({ IDL }) => {
  const ToEntry = IDL.Record({
    'status' : IDL.Variant({
      'pending' : IDL.Null,
      'approved' : IDL.Null,
      'declined' : IDL.Null,
    }),
    'principal' : IDL.Principal,
    'name' : IDL.Text,
    'amount' : IDL.Nat,
  });
  const TransactionStatus = IDL.Text;
  const Transaction = IDL.Record({
    'id' : IDL.Text,
    'to' : IDL.Vec(ToEntry),
    'status' : TransactionStatus,
    'title' : IDL.Text,
    'from' : IDL.Principal,
    'isRead' : IDL.Bool,
    'timestamp' : IDL.Nat,
    'releasedAt' : IDL.Opt(IDL.Nat),
  });
  const ParticipantShare = IDL.Record({
    'principal' : IDL.Principal,
    'amount' : IDL.Nat,
  });
  const SplitDApp = IDL.Service({
    'cancelSplit' : IDL.Func([IDL.Principal], [], []),
    'getAdmin' : IDL.Func([], [IDL.Principal], ['query']),
    'getBalance' : IDL.Func([IDL.Principal], [IDL.Nat], ['query']),
    'getNickname' : IDL.Func([IDL.Principal], [IDL.Opt(IDL.Text)], ['query']),
    'getTransaction' : IDL.Func(
        [IDL.Text, IDL.Principal],
        [IDL.Opt(Transaction)],
        [],
      ),
    'getTransactionsPaginated' : IDL.Func(
        [IDL.Principal, IDL.Nat, IDL.Nat],
        [
          IDL.Record({
            'totalCount' : IDL.Nat,
            'totalPages' : IDL.Nat,
            'transactions' : IDL.Vec(Transaction),
          }),
        ],
        [],
      ),
    'initiateEscrow' : IDL.Func(
        [IDL.Principal, IDL.Vec(ParticipantShare), IDL.Text],
        [IDL.Text],
        [],
      ),
    'markTransactionsAsRead' : IDL.Func([IDL.Principal], [], []),
    'recipientApproveEscrow' : IDL.Func(
        [IDL.Principal, IDL.Text, IDL.Principal],
        [],
        [],
      ),
    'recipientDeclineEscrow' : IDL.Func(
        [IDL.Principal, IDL.Nat, IDL.Principal],
        [],
        [],
      ),
    'releaseSplit' : IDL.Func([IDL.Principal, IDL.Text], [], []),
    'setInitialBalance' : IDL.Func(
        [IDL.Principal, IDL.Nat, IDL.Principal],
        [],
        [],
      ),
    'setNickname' : IDL.Func([IDL.Principal, IDL.Text], [], []),
  });
  return SplitDApp;
};
export const init = ({ IDL }) => { return [IDL.Principal]; };
