import { describe, expect, it } from 'vitest';
import { buildCustomEntry, getPreferenceSummary, removeCustomEntry, upsertCustomEntry } from './personalJourney';

describe('personalJourney helpers', () => {
  it('summarizes a fellowship-focused profile for the journey view', () => {
    const summary = getPreferenceSummary({
      country: 'United States',
      primary_goal: 'fellowship',
      fellowship_type: 'Cardiology',
      visa_status: 'J1',
    });

    expect(summary.goalLabel).toBe('Fellowship');
    expect(summary.focusLabel).toBe('Cardiology');
    expect(summary.summary).toContain('Fellowship');
    expect(summary.summary).toContain('J-1 focused');
  });

  it('creates and updates user-created entries for saved opportunities', () => {
    const initial = [];
    const added = upsertCustomEntry(initial, {
      entryType: 'program',
      name: 'Mayo Clinic',
      category: 'Cardiology',
      location: 'Rochester, MN',
      notes: 'Good fit',
      rating: 4,
    });

    expect(added).toHaveLength(1);
    expect(added[0].name).toBe('Mayo Clinic');

    const updated = upsertCustomEntry(added, {
      id: added[0].id,
      entryType: 'program',
      name: 'Mayo Clinic',
      category: 'Cardiology',
      location: 'Rochester, MN',
      notes: 'Great mentorship',
      rating: 5,
    });

    expect(updated[0].notes).toBe('Great mentorship');
    expect(updated[0].rating).toBe(5);
  });

  it('removes a custom entry by id', () => {
    const entry = buildCustomEntry({ name: 'UCLA', entryType: 'school' });
    const remaining = removeCustomEntry([entry], entry.id);
    expect(remaining).toHaveLength(0);
  });
});
