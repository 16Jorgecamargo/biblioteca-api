import { addDays, daysBetween, toIsoDate } from './date.utils.js';

describe('date.utils', () => {
  it('formata a data local como YYYY-MM-DD', () => {
    expect(toIsoDate(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
  });

  it('soma dias atravessando o fim do mês', () => {
    expect(addDays('2026-11-20', 14)).toBe('2026-12-04');
  });

  it('soma dias atravessando o fim do ano', () => {
    expect(addDays('2026-12-25', 14)).toBe('2027-01-08');
  });

  it('subtrai dias com valor negativo', () => {
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('conta os dias entre duas datas', () => {
    expect(daysBetween('2026-11-01', '2026-11-04')).toBe(3);
  });

  it('retorna negativo quando a segunda data vem antes', () => {
    expect(daysBetween('2026-11-04', '2026-11-01')).toBe(-3);
  });
});
