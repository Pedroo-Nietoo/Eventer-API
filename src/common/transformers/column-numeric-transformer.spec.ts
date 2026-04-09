import { ColumnNumericTransformer } from './column-numeric-transformer';

describe('ColumnNumericTransformer', () => {
 let transformer: ColumnNumericTransformer;

 beforeEach(() => {
  transformer = new ColumnNumericTransformer();
 });

 it('deve estar definido', () => {
  expect(transformer).toBeDefined();
 });

 describe('from', () => {
  it('deve converter uma string numérica para um número (float)', () => {
   const input = '150.55';
   const result = transformer.from(input);

   expect(result).toBe(150.55);
   expect(typeof result).toBe('number');
  });

  it('deve retornar NaN se a entrada não for um número válido', () => {
   const input = 'not-a-number';
   const result = transformer.from(input);

   expect(result).toBeNaN();
  });

  it('deve lidar com números inteiros em formato de string', () => {
   const input = '100';
   const result = transformer.from(input);

   expect(result).toBe(100);
   expect(typeof result).toBe('number');
  });
 });

 describe('to', () => {
  it('deve retornar o número exatamente como recebido para persistência no banco', () => {
   const input = 250.75;
   const result = transformer.to(input);

   expect(result).toBe(input);
  });
 });
});