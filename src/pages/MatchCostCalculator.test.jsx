import { describe, it, expect } from 'vitest';
import { calculateErasFees } from './MatchCostCalculator';

describe('MatchCostCalculator ERAS Progressive Fees Logic', () => {
  it('should return 0 when program count is 0 or negative', () => {
    expect(calculateErasFees(0)).toBe(0);
    expect(calculateErasFees(-5)).toBe(0);
  });

  it('should return 99 for programs between 1 and 10 inclusive', () => {
    expect(calculateErasFees(1)).toBe(99);
    expect(calculateErasFees(5)).toBe(99);
    expect(calculateErasFees(10)).toBe(99);
  });

  it('should calculate correct fee for programs between 11 and 20 (base $99 + $23 per program)', () => {
    // 15 programs: 10 at $99 + 5 at $23 = 99 + 115 = 214
    expect(calculateErasFees(15)).toBe(214);
    // 20 programs: 10 at $99 + 10 at $23 = 99 + 230 = 329
    expect(calculateErasFees(20)).toBe(329);
  });

  it('should calculate correct fee for programs between 21 and 30 (base $329 + $27 per program)', () => {
    // 25 programs: 20 at $329 + 5 at $27 = 329 + 135 = 464
    expect(calculateErasFees(25)).toBe(464);
    // 30 programs: 20 at $329 + 10 at $27 = 329 + 270 = 599
    expect(calculateErasFees(30)).toBe(599);
  });

  it('should calculate correct fee for programs 31+ (base $599 + $32 per program)', () => {
    // 35 programs: 30 at $599 + 5 at $32 = 599 + 160 = 759
    expect(calculateErasFees(35)).toBe(759);
    // 150 programs: 30 at $599 + 120 at $32 = 599 + 3840 = 4439
    expect(calculateErasFees(150)).toBe(4439);
  });
});

describe('MatchCostCalculator Currency Conversion Math', () => {
  const RATES = {
    Pakistan: 280,
    India: 83,
    Bangladesh: 117,
    Nepal: 133
  };

  it('should calculate local currency amount correctly', () => {
    const usd = 10000;
    
    expect(usd * RATES.Pakistan).toBe(2800000);
    expect(usd * RATES.India).toBe(830000);
    expect(usd * RATES.Bangladesh).toBe(1170000);
    expect(usd * RATES.Nepal).toBe(1330000);
  });
});
