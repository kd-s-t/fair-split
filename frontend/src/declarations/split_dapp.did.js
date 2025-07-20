export const idlFactory = ({ IDL }) => {
  const SplitRecord = IDL.Record({
    'participant' : IDL.Principal,
    'share' : IDL.Nat,
  });
  const SplitDApp = IDL.Service({
    'getAdmin' : IDL.Func([], [IDL.Principal], ['query']),
    'getLogs' : IDL.Func([], [IDL.Vec(IDL.Text)], ['query']),
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
