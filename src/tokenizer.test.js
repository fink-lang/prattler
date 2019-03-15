import {init_tokenizer, add_token} from './tokenizer';
import {end_token, get_next_token} from './tokenizer';


describe('tokenizer', ()=> {

  const tokenize = (code)=> {
    let ctx = init_tokenizer(code)
      |> add_token(' ')
      |> add_token('\n')
      |> add_token('=')
      |> add_token('!=')
      |> add_token('ni', false);

    return ()=> {
      let token = null;
      [token, ctx]= get_next_token(ctx);
      return token;
    };
  };


  it('tokenizes single line', ()=> {
    const next_token = tokenize('foo = 1234');

    expect(next_token()).toEqual({
      value: 'foo',
      loc: {
        start: {pos: 0, line: 1, column: 0},
        end: {pos: 3, line: 1, column: 3}
      }
    });

    expect(next_token()).toEqual({
      value: ' ',
      loc: {
        start: {pos: 3, line: 1, column: 3},
        end: {pos: 4, line: 1, column: 4}
      }
    });

    expect(next_token()).toEqual({
      value: '=',
      loc: {
        start: {pos: 4, line: 1, column: 4},
        end: {pos: 5, line: 1, column: 5}
      }
    });

    expect(next_token()).toEqual({
      value: ' ',
      loc: {
        start: {pos: 5, line: 1, column: 5},
        end: {pos: 6, line: 1, column: 6}
      }
    });

    expect(next_token()).toEqual({
      value: '1234',
      loc: {
        start: {pos: 6, line: 1, column: 6},
        end: {pos: 10, line: 1, column: 10}
      }
    });

    expect(next_token()).toEqual({
      value: end_token,
      loc: {
        start: {pos: 10, line: 1, column: 10},
        end: {pos: 10, line: 1, column: 10}
      }
    });
  });

  it('tokenizes multiple lines', ()=> {
    const next_token = tokenize('foo\n 1234');

    expect(next_token()).toEqual({
      value: 'foo',
      loc: {
        start: {pos: 0, line: 1, column: 0},
        end: {pos: 3, line: 1, column: 3}
      }
    });

    expect(next_token()).toEqual({
      value: '\n',
      loc: {
        start: {pos: 3, line: 1, column: 3},
        end: {pos: 4, line: 2, column: 0}
      }
    });

    expect(next_token()).toEqual({
      value: ' ',
      loc: {
        start: {pos: 4, line: 2, column: 0},
        end: {pos: 5, line: 2, column: 1}
      }
    });

    expect(next_token()).toEqual({
      value: '1234',
      loc: {
        start: {pos: 5, line: 2, column: 1},
        end: {pos: 9, line: 2, column: 5}
      }
    });

    expect(next_token()).toEqual({
      value: end_token,
      loc: {
        start: {pos: 9, line: 2, column: 5},
        end: {pos: 9, line: 2, column: 5}
      }
    });
  });

  it('tokenizes separating multi-char symbols', ()=> {
    const next_token = tokenize('ni =!= 123');

    expect(next_token()).toEqual({
      value: 'ni',
      loc: {
        start: {pos: 0, line: 1, column: 0},
        end: {pos: 2, line: 1, column: 2}
      }
    });

    expect(next_token()).toEqual({
      value: ' ',
      loc: {
        start: {pos: 2, line: 1, column: 2},
        end: {pos: 3, line: 1, column: 3}
      }
    });

    expect(next_token()).toEqual({
      value: '=',
      loc: {
        start: {pos: 3, line: 1, column: 3},
        end: {pos: 4, line: 1, column: 4}
      }
    });

    expect(next_token()).toEqual({
      value: '!=',
      loc: {
        start: {pos: 4, line: 1, column: 4},
        end: {pos: 6, line: 1, column: 6}
      }
    });

    expect(next_token()).toEqual({
      value: ' ',
      loc: {
        start: {pos: 6, line: 1, column: 6},
        end: {pos: 7, line: 1, column: 7}
      }
    });

    expect(next_token()).toEqual({
      value: '123',
      loc: {
        start: {pos: 7, line: 1, column: 7},
        end: {pos: 10, line: 1, column: 10}
      }
    });

    expect(next_token()).toEqual({
      value: end_token,
      loc: {
        start: {pos: 10, line: 1, column: 10},
        end: {pos: 10, line: 1, column: 10}
      }
    });
  });


  it('tokenizes non-separating multi-char symbols', ()=> {
    const next_token = tokenize('ni nini');

    expect(next_token()).toEqual({
      value: 'ni',
      loc: {
        start: {pos: 0, line: 1, column: 0},
        end: {pos: 2, line: 1, column: 2}
      }
    });

    expect(next_token()).toEqual({
      value: ' ',
      loc: {
        start: {pos: 2, line: 1, column: 2},
        end: {pos: 3, line: 1, column: 3}
      }
    });

    expect(next_token()).toEqual({
      value: 'nini',
      loc: {
        start: {pos: 3, line: 1, column: 3},
        end: {pos: 7, line: 1, column: 7}
      }
    });

    expect(next_token()).toEqual({
      value: end_token,
      loc: {
        start: {pos: 7, line: 1, column: 7},
        end: {pos: 7, line: 1, column: 7}
      }
    });
  });

  it('handles empty code', ()=> {
    const next_token = tokenize('');

    expect(next_token()).toEqual({
      value: end_token,
      loc: {
        start: {pos: 0, line: 1, column: 0},
        end: {pos: 0, line: 1, column: 0}
      }
    });
  });
});
