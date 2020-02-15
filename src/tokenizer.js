import {obj_has} from './obj';

export const end_token = Symbol('end');


const get_partials = ([start, ...rest], pre='')=> {
  if (rest.length === 0) {
    return {[`${pre}${start}`]: false};
  }

  return {[`${pre}${start}`]: true, ...get_partials(rest, `${pre}${start}`)};
};


const get_loc = (char, {pos, line, column})=> {
  if (char === '\n') {
    return {pos: pos + 1, line: line + 1, column: 0};
  }

  return {pos: pos + 1, line, column: column + 1};
};

const get_next_char = (code, loc)=> {
  const char = code[loc.pos];
  const new_loc = get_loc(char, loc);
  return [char, new_loc];
};

const handle_end = (value, start, end, ctx)=> {
  if (value !== '') {
    return [
      {value, loc: {start, end}},
      {...ctx, partial_token: {value: '', loc: {start, end}}}
    ];
  }

  return [
    {value: end_token, loc: {start: end, end}},
    {...ctx, partial_token: {value: '', loc: {start, end}}}
  ];
};


// eslint-disable-next-line max-statements
export const get_next_token = (ctx)=> {
  const {code, partials, separators, partial_token} = ctx;
  let {value, loc: {start, end}} = partial_token;

  while (end.pos < code.length) {
    const [char, new_end] = get_next_char(code, end);
    const new_value = `${value}${char}`;

    const is_seperator = (
      obj_has(separators, char) || obj_has(separators, value)
    );
    const is_partial = obj_has(partials, new_value);

    if (is_seperator && !is_partial) {

      return [
        {value, loc: {start, end}},
        {...ctx, partial_token: {value: char, loc: {start: end, end: new_end}}}
      ];
    }

    value = new_value;
    end = new_end;
  }

  return handle_end(value, start, end, ctx);
};


export const init_tokenizer = (code)=> ({
  code,

  partials: {},
  separators: {},

  partial_token: {
    value: '',
    loc: {
      start: {pos: 0, line: 1, column: 0},
      end: {pos: 0, line: 1, column: 0}
    }
  }
});


// eslint-disable-next-line max-len
export const add_token = (value, is_sep=true)=> ({partials, separators, ...ctx})=> ({
  ...ctx,

  partials: is_sep
    ? {...partials, ...get_partials(value)}
    : partials,

  separators: is_sep
    ? {...separators, [value]: true}
    : separators
});

