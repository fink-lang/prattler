import {highlight_code_loc} from '@fink/snippet';


export const token_error = (msg, token, {tokenizer: {code}})=> {
  const snippet = highlight_code_loc(code, token.loc);
  const err = new Error(`${msg}\n${snippet}`);
  // TODO: remove first line of err.stack
  return err;
};
