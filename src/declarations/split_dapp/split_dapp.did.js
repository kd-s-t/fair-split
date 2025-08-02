export const idlFactory = ({ IDL }) => {
  const FraudActivity = IDL.Record({
    'activityType' : IDL.Text,
    'timestamp' : IDL.Int,
    'transactionId' : IDL.Text,
  });
  const ToEntry = IDL.Record({
    'status' : IDL.Variant({
      'pending' : IDL.Null,
      'approved' : IDL.Null,
      'noaction' : IDL.Null,
      'declined' : IDL.Null,
    }),
    'principal' : IDL.Principal,
    'approvedAt' : IDL.Opt(IDL.Nat),
    'name' : IDL.Text,
    'declinedAt' : IDL.Opt(IDL.Nat),
    'amount' : IDL.Nat,
    'percentage' : IDL.Nat,
    'readAt' : IDL.Opt(IDL.Nat),
  });
  const TransactionStatus = IDL.Text;
  const Transaction = IDL.Record({
    'id' : IDL.Text,
    'to' : IDL.Vec(ToEntry),
    'status' : TransactionStatus,
    'title' : IDL.Text,
    'from' : IDL.Principal,
    'createdAt' : IDL.Nat,
    'confirmedAt' : IDL.Opt(IDL.Nat),
    'refundedAt' : IDL.Opt(IDL.Nat),
    'cancelledAt' : IDL.Opt(IDL.Nat),
    'bitcoinTransactionHash' : IDL.Opt(IDL.Text),
    'bitcoinAddress' : IDL.Opt(IDL.Text),
    'releasedAt' : IDL.Opt(IDL.Nat),
    'readAt' : IDL.Opt(IDL.Nat),
  });
  const ParticipantShare = IDL.Record({
    'principal' : IDL.Principal,
    'nickname' : IDL.Text,
    'amount' : IDL.Nat,
    'percentage' : IDL.Nat,
  });
  const SplitDApp = IDL.Service({
    'canUserCreateEscrow' : IDL.Func([IDL.Principal], [IDL.Bool], ['query']),
    'cancelSplit' : IDL.Func([IDL.Principal], [], []),
    'getAdmin' : IDL.Func([], [IDL.Principal], ['query']),
    'getAllNicknames' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Text))],
        ['query'],
      ),
    'getBalance' : IDL.Func([IDL.Principal], [IDL.Nat], ['query']),
    'getBitcoinTransactionHash' : IDL.Func(
        [IDL.Text, IDL.Principal],
        [IDL.Opt(IDL.Text)],
        [],
      ),
    'getCustomNickname' : IDL.Func(
        [IDL.Principal],
        [IDL.Opt(IDL.Text)],
        ['query'],
      ),
    'getFraudHistory' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(FraudActivity)],
        ['query'],
      ),
    'getNickname' : IDL.Func([IDL.Principal], [IDL.Opt(IDL.Text)], ['query']),
    'getReputationStats' : IDL.Func(
        [IDL.Principal],
        [
          IDL.Record({
            'fraudCount' : IDL.Nat,
            'canCreateEscrow' : IDL.Bool,
            'reputation' : IDL.Nat,
            'isFlagged' : IDL.Bool,
          }),
        ],
        ['query'],
      ),
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
    'getUserReputationScore' : IDL.Func([IDL.Principal], [IDL.Nat], ['query']),
    'initiateEscrow' : IDL.Func(
        [IDL.Principal, IDL.Vec(ParticipantShare), IDL.Text],
        [IDL.Text],
        [],
      ),
    'isUserFlaggedForFraud' : IDL.Func([IDL.Principal], [IDL.Bool], ['query']),
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
    'removeNickname' : IDL.Func([IDL.Principal], [], []),
    'resetUserReputation' : IDL.Func([IDL.Principal, IDL.Principal], [], []),
    'setCustomNickname' : IDL.Func([IDL.Principal, IDL.Text], [], []),
    'setInitialBalance' : IDL.Func(
        [IDL.Principal, IDL.Nat, IDL.Principal],
        [],
        [],
      ),
    'setNickname' : IDL.Func([IDL.Principal, IDL.Text], [], []),
    'updateBitcoinTransactionHash' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Principal],
        [IDL.Bool],
        [],
      ),
  });
  return SplitDApp;
};
export const init = ({ IDL }) => { return [IDL.Principal]; };
