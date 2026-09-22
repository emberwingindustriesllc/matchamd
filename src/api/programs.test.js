import { describe, it, expect, vi } from 'vitest';
import { fetchProgramById } from './programs';

describe('fetchProgramById', () => {
  it('falls back to mock residency dataset for local programs', async () => {
    const program = await fetchProgramById('marshall_peds');
    expect(program).toBeDefined();
    expect(program.id).toBe('marshall_peds');
    expect(program.program_name).toContain('Pediatrics');
    expect(program.city).toBe('Huntington');
    expect(program.state).toBe('WV');
  });

  it('falls back to mock fellowship dataset for fellowship programs', async () => {
    const program = await fetchProgramById('marshall_nicu');
    expect(program).toBeDefined();
    expect(program.id).toBe('marshall_nicu');
    expect(program.program_type).toBe('fellowship');
    expect(program.subspecialty).toBe('Neonatal-Perinatal Medicine');
  });

  it('falls back to mock observership dataset for observership programs', async () => {
    const program = await fetchProgramById('obs_marshall_peds');
    expect(program).toBeDefined();
    expect(program.program_type).toBe('observership');
    expect(program.city).toBe('Huntington');
  });

  it('throws an error if a program is not found in either database or local dataset', async () => {
    await expect(fetchProgramById('non_existent_program_99999')).rejects.toThrow('Program not found');
  });
});
