export const idlFactory = ({ IDL }) => {
  const Transaction = IDL.Record({
    'to' : IDL.Principal,
    'from' : IDL.Principal,
    'timestamp' : IDL.Nat,
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
    'setInitialBalance' : IDL.Func(
        [IDL.Principal, IDL.Nat, IDL.Principal],
        [],
        [],
      ),
    'setName' : IDL.Func([IDL.Principal, IDL.Text], [], []),
    'splitBill' : IDL.Func(
        [
          IDL.Record({
            'participants' : IDL.Vec(IDL.Principal),
            'total' : IDL.Nat,
          }),
          IDL.Principal,
        ],
        [IDL.Vec(SplitRecord)],
        [],
      ),
  });
  return SplitDApp;
};
export const init = ({ IDL }) => { return [IDL.Principal]; };
