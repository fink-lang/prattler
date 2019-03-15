import {init_tokenizer, end_token, get_next_token} from './tokenizer';
import {init_symbols, ignorable, next_lbp, led, nud} from './symbols';
import {token_error} from './errors';
import {inspect} from 'util';


export const curr_is = ({curr_token}, expected)=> (
  curr_token.value === expected
);


export const curr_value = ({curr_token})=> (
  curr_token.value
);


export const curr_loc = ({curr_token})=> (
  curr_token.loc
);


export const next_is = ({next_token}, expected)=> (
  next_token.value === expected
);


export const next_matches = ({next_token}, regex)=> (
  typeof next_token.value === 'string' && next_token.value.match(regex)
);


export const next_is_end = (ctx, expected_end)=> (
  next_is(ctx, end_token) || next_is(ctx, expected_end)
);

export const next_loc = ({next_token})=> (
  next_token.loc
);


const assert_token = (token, expected, ctx)=> {
  if (token.value !== expected) {
    throw token_error(
      `Expected ${inspect(expected)} but found ${inspect(token.value)}:`,
      token, ctx
    );
  }
};


export const assert_next = (ctx, expected)=> {
  const {next_token} = ctx;
  assert_token(next_token, expected, ctx);
};


export const assert_curr = (ctx, expected)=> {
  const {curr_token} = ctx;
  assert_token(curr_token, expected, ctx);
};


const assert_not_end = (ctx)=> {
  if (next_is_end(ctx)) {
    throw token_error(`Unexpected end of code:`, ctx.curr_token, ctx);
  }
};


export const advance = (ctx)=> {
  const curr_token = ctx.next_token;
  const ignored_tokens = [];

  // TODO: should it return [tokenizer_ctx, next_token]?
  let [next_token, tokenizer] = get_next_token(ctx.tokenizer);

  while (ignorable(ctx, next_token)) {
    ignored_tokens.push(next_token);
    [next_token, tokenizer] = get_next_token(tokenizer);
  }

  return {...ctx, tokenizer, curr_token, next_token, ignored_tokens};
};


export const assert_advance = (ctx, expected)=> {
  assert_next(ctx, expected);
  return advance(ctx);
};


const ignored_text = (ctx)=> (
  ctx.ignored_tokens.map(({value})=> value).join('')
);


// eslint-disable-next-line max-statements
export const collect_text = (ctx, ...stop_token_values)=> {
  const stop_at = new Set(stop_token_values);

  let {next_token, curr_token, tokenizer} = ctx;
  let {start, end} = curr_token.loc;

  let text = ignored_text(ctx);
  const ignored_tokens = [];

  while (!(next_token.value === end_token || stop_at.has(next_token.value))) {
    curr_token = next_token;
    [next_token, tokenizer] = get_next_token(tokenizer);
    text += curr_token.value;
    end = next_token.loc.end;
  }

  const next_ctx = {...ctx, tokenizer, curr_token, next_token, ignored_tokens};
  assert_not_end(next_ctx);

  return [{text, loc: {start, end}}, advance(next_ctx)];
};


export const expression = (ctx, rbp)=> {
  assert_not_end(ctx);
  ctx = advance(ctx);

  let left = null;
  [left, ctx] = nud(ctx);

  while (rbp < next_lbp(ctx, left)) {
    ctx = advance(ctx);

    [left, ctx] = led(ctx, left);
  }

  return [left, ctx];
};


export const init_parser = ({code})=> ({
  curr_token: null,
  next_token: {
    loc: {
      start: {pos: 0, line: 1, column: 0},
      end: {pos: 0, line: 1, column: 0}
    }
  },
  ignored_tokens: [],

  tokenizer: init_tokenizer(code),
  symbols: init_symbols()
});


export const start_parser = (ctx)=> advance(ctx);

