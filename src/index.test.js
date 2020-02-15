import {init_parser, start_parser} from '.';
import {curr_is, curr_value, curr_loc} from '.';
import {next_is, next_is_end, next_matches, next_loc} from '.';
import {assert_curr, assert_next, assert_advance} from '.';
import {expression, collect_text} from '.';

import {add_non_binding, add_operator_like, add_whitespace} from './symbols';
import {add_non_separating} from './symbols';
import {symbol, other_token} from './symbols';

import {end_token} from './tokenizer';


const unindent = (strings, ...parts)=> {
  const [, ...lines] = String.raw({raw: strings}, ...parts).split('\n');
  const ind = lines[0].search(/[^ ]/);
  const str = lines.map((lne)=> lne.slice(ind)).join('\n');
  return str;
};


const other = ()=> ({
  ...symbol(other_token),

  nud: ()=> (ctx)=> (
    [{type: other_token, value: ctx.curr_token.value}, ctx]
  )
});


const infix = (op)=> ({
  ...symbol(op),

  led: (lbp)=> (ctx, left)=> {
    const [right, next_ctx] = expression(ctx, lbp);
    return [{type: 'infx', op, left, right}, next_ctx];
  }
});


const string = (op)=> ({
  ...symbol(op),

  nud: ()=> (ctx)=> {
    const [txt, next_ctx] = collect_text(ctx, op);
    return [{type: 'string', op, value: txt.text}, next_ctx];
  }
});


const init_test_lang = (ctx)=> (
  ctx
    |> add_whitespace(' ')
    |> add_whitespace('\n')

    |> add_non_binding(symbol(';'))

    |> add_non_separating(other())

    |> add_operator_like(string(`'`))

    |> add_operator_like(infix('='))

);


const parse = (code)=> {
  const ctx = {code}
    |> init_parser
    |> init_test_lang
    |> start_parser;

  return expression(ctx, 0);
};


describe('parser', ()=> {
  it('parses simple expression', ()=> {
    const [ast, ctx] = parse(unindent`
      foobar = 123
    `);

    expect(ast).toEqual({
      type: 'infx',
      op: '=',
      left: {
        type: other_token,
        value: 'foobar'
      },
      right: {
        type: other_token,
        value: '123'
      }
    });
    expect(next_is_end(ctx)).toBe(true);
  });


  it('parses string collecting text to end of string', ()=> {
    const [ast, ctx] = parse(unindent`
      ' foobar = 123 '
    `);

    expect(ast).toEqual({
      type: 'string',
      op: `'`,
      value: ' foobar = 123 '
    });
    expect(next_is_end(ctx)).toBe(true);
  });
});


describe('curr token tests, values, and assertions', ()=> {
  it('checks if current token value is same as expected', ()=> {
    const [, ctx] = parse(`foobar = 123`);

    expect(curr_is(ctx, '123')).toBe(true);
  });


  it('checks if  current token value', ()=> {
    const [, ctx] = parse(`foobar = 123`);

    expect(curr_value(ctx)).toBe('123');
  });


  it('gets current token loc', ()=> {
    const [, ctx] = parse(`foobar = 123`);

    expect(curr_loc(ctx)).toEqual({
      start: {column: 9, line: 1, pos: 9},
      end: {column: 12, line: 1, pos: 12}
    });
  });


  it('handles token value assertions for current token', ()=> {
    const [, ctx] = parse(`foobar = 123`);

    expect(()=> assert_curr(ctx, '123')).not.toThrow();
    expect(()=> assert_curr(ctx, 'foobar')).toThrow(unindent`
      Expected 'foobar' but found '123':
      1| foobar = 123
                  ^`
    );
  });
});


describe('next token tests and assertions', ()=> {
  it('checks if next token value is same as expected', ()=> {
    const [, ctx] = parse(`foobar = 123;`);

    expect(next_is(ctx, ';')).toBe(true);
  });


  it('checks if next token matches', ()=> {
    const [, ctx] = parse(`foobar = 123;`);

    expect(next_matches(ctx, /;/)).not.toBe();
  });


  it('gets next token loc', ()=> {
    const [, ctx] = parse(`foobar = 123`);

    expect(next_loc(ctx)).toEqual({
      start: {column: 12, line: 1, pos: 12},
      end: {column: 12, line: 1, pos: 12}
    });
  });


  it('handles token value assertions for next token', ()=> {
    const [, ctx] = parse(`foobar = 123`);

    expect(()=> assert_next(ctx, end_token)).not.toThrow();
    expect(()=> assert_next(ctx, '123')).toThrow(unindent`
      Expected '123' but found Symbol(end):
      1| foobar = 123
                     ^`
    );
  });
});


describe('advance to next token or throw', ()=> {

  it('advances to the next token if next token value is as expected', ()=> {
    const [, ctx] = parse(`foobar = 123; shrub = ni`);

    const next_ctx = assert_advance(ctx, ';');
    expect(next_is(next_ctx, 'shrub')).toBe(true);
  });


  it('throws when next token value is unexpected', ()=> {
    const [, ctx] = parse(`foobar = 123; shrub = ni`);

    expect(()=> assert_advance(ctx, '==')).toThrow(unindent`
      Expected '==' but found ';':
      1| foobar = 123; shrub = ni
                     ^`
    );
  });
});


describe('parse exceptions', ()=> {
  it('throws unexpected end of code', ()=> {
    const test_parse = ()=> parse(unindent`
      foobar =
    `);

    expect(test_parse).toThrow(unindent`
      Unexpected end of code:
      1| foobar =
                ^`
    );
  });


  it('throws unexpected infix', ()=> {
    const test_parse = ()=> parse(unindent`
      = 123`
    );

    expect(test_parse).toThrow(unindent`
      Cannot use '123' as an infix operator:
      1| = 123
           ^`
    );
  });


  it('throws non infix operator', ()=> {
    const test_parse = ()=> parse(unindent`
      foo = spam ni
    `);

    expect(test_parse).toThrow(unindent`
      Cannot use 'ni' as an infix operator:
      1| foo = spam ni
                    ^
      2| `
    );
  });


  it('throws collecting text when not finding expected end', ()=> {
    const test_parse = ()=> parse(unindent`
      'foo bar`
    );

    expect(test_parse).toThrow(unindent`
      Unexpected end of code:
      1| 'foo bar
              ^`
    );
  });
});

