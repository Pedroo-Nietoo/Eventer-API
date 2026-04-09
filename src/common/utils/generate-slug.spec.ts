import generateSlug from './generate-slug';

describe('generateSlug', () => {
 it('deve converter todo o texto para letras minúsculas', () => {
  expect(generateSlug('FESTA NA PRAIA')).toBe('festa-na-praia');
 });

 it('deve substituir espaços por hífens', () => {
  expect(generateSlug('meu evento incrivel')).toBe('meu-evento-incrivel');
 });

 it('deve remover espaços extras no início e no final (trim)', () => {
  expect(generateSlug('  evento top  ')).toBe('evento-top');
 });

 it('deve remover caracteres especiais (não-alfanuméricos) e trocar por hífens', () => {
  expect(generateSlug('Festa @ Praia! 2026')).toBe('festa-praia-2026');
 });

 it('deve evitar múltiplos hífens seguidos', () => {
  expect(generateSlug('evento   com     muitos --- espacos')).toBe('evento-com-muitos-espacos');
 });

 it('não deve deixar hífens pendurados no começo ou no final', () => {
  expect(generateSlug('---evento-isolado---')).toBe('evento-isolado');
 });
});