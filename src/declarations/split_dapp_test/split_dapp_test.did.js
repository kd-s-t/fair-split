export const idlFactory = ({ IDL }) => {
  return IDL.Service({ 'run' : IDL.Func([], [], []) });
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const init = ({ IDL }) => { return []; };
