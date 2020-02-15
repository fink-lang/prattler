import {add_token, end_token} from './tokenizer';
import {token_error} from './errors';
import {inspect} from 'util';
import {obj_has} from './obj';


export const other_token = Symbol('other');


const auto = Symbol('auto');


export const symbol = (id)=> ({
  id,
  lbp: (lbp)=> ()=> lbp,
  nud: null,
  led: null
});


export const init_symbols = ()=> ({
  next_lbp: 2,
  lbps: {[end_token]: ()=> 0},
  nuds: {},
  leds: {},
  igns: {}
});


const add_symbol = (symb, lbp, is_sep)=> ({symbols, tokenizer, ...ctx})=> {
  const {next_lbp, lbps, nuds, leds} = symbols;

  const symb_lbp = lbp === auto ? next_lbp : lbp;
  const lbp_fn = symb.lbp(symb_lbp);

  const nud = symb.nud ? symb.nud(symb_lbp) : false;
  const led = symb.led ? symb.led(symb_lbp) : false;

  return {
    ...ctx,
    tokenizer: tokenizer |> add_token(symb.id, is_sep),
    symbols: {
      next_lbp: next_lbp + 2,
      lbps: {...lbps, [symb.id]: lbp_fn},
      nuds: nud ? {...nuds, [symb.id]: nud} : nuds,
      leds: led ? {...leds, [symb.id]: led} : leds
    }
  };
};

export const add_whitespace = (token_val)=> ({tokenizer, igns, ...ctx})=> ({
  ...ctx,
  tokenizer: tokenizer |> add_token(token_val, true),
  igns: {...igns, [token_val]: true}
});

// TODO: rename: add_separator
export const add_non_binding = (symb)=> add_symbol(symb, 0, true);

// TODO: rename: add_operator
export const add_operator_like = (symb)=> add_symbol(symb, auto, true);

// TODO: rename: add_itendifier
export const add_non_separating = (symb)=> add_symbol(symb, auto, false);

// TODO: add_literal
// TODO: add_comment
// TODO: add_keyword


export const ignorable = (ctx, token)=> {
  if (token && obj_has(ctx.igns, token.value)) {
    return true;
  }
  return false;
};


export const nud = (ctx)=> {
  const {curr_token, symbols: {nuds}} = ctx;
  const nud_fn = obj_has(nuds, curr_token.value)
    ? nuds[curr_token.value]
    : nuds[other_token];

  // TODO: can anything be the start of an expr?
  // if (!nud_fn) {
  //   throw token_error(
  //     `Cannot use ${inspect(curr_token.value)} as start of expression:`,
  //     curr_token, ctx
  //   );
  // }

  return nud_fn(ctx);
};


export const led = (ctx, left)=> {
  const {curr_token, symbols: {leds}} = ctx;
  const led_fn = obj_has(leds, curr_token.value)
    ? leds[curr_token.value]
    : leds[other_token];

  if (!led_fn) {
    throw token_error(
      `Cannot use ${inspect(curr_token.value)} as an infix operator:`,
      curr_token, ctx
    );
  }

  return led_fn(ctx, left);
};


export const next_lbp = (ctx, left)=> {
  const {next_token, symbols: {lbps}} = ctx;

  const lbp_fn = obj_has(lbps, next_token.value)
    ? lbps[next_token.value]
    : lbps[other_token];

  return lbp_fn(ctx, left);
};

