export const idlFactory = ({ IDL }) => {
  return IDL.Service({ 'run' : IDL.Func([], [], []) });
};
export const init = ({ IDL }) => { return []; };
