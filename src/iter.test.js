import {find} from './iter';


test('iter', ()=> {

  const foo = '123456'
    |> find((item)=> item === '3');

  expect(foo).toBe('3');
});
