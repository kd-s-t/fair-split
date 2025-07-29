export const idlFactory = ({ IDL }) => {
  const PendingTransfer = IDL.Record({
    'to' : IDL.Principal,
    'name' : IDL.Text,
    'initiatedAt' : IDL.Nat,
    'amount' : IDL.Nat,
  });
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
  });
  const ParticipantShare = IDL.Record({
    'principal' : IDL.Principal,
    'amount' : IDL.Nat,
  });
  const SplitDApp = IDL.Service({
    'cancelEscrow' : IDL.Func([IDL.Principal, IDL.Nat], [], []),
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
    'getPendingApprovalsForRecipient' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(Transaction)],
        ['query'],
      ),
    'getTransaction' : IDL.Func(
        [IDL.Text, IDL.Principal],
        [IDL.Opt(Transaction)],
        [],
      ),
    'getTransactions' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(Transaction)],
        ['query'],
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
    'initiateSplit' : IDL.Func(
        [IDL.Principal, IDL.Vec(ParticipantShare), IDL.Text],
        [],
        [],
      ),
    'markTransactionsAsRead' : IDL.Func([IDL.Principal], [], []),
    'recipientApproveEscrow' : IDL.Func(
        [IDL.Principal, IDL.Nat, IDL.Principal],
        [],
        [],
      ),
    'recipientDeclineEscrow' : IDL.Func(
        [IDL.Principal, IDL.Nat, IDL.Principal],
        [],
        [],
      ),
    'releaseEscrow' : IDL.Func([IDL.Principal, IDL.Nat], [], []),
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
