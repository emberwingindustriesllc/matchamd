import { describe, expect, it } from 'vitest';
import { buildCustomEntry, getJourneyHighlights, getNextActionChecklist, getPreferenceSummary, removeCustomEntry, upsertCustomEntry } from './personalJourney';

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

  it('builds dashboard-friendly journey highlights from profile and saved items', () => {
    const highlights = getJourneyHighlights(
      {
        primary_goal: 'fellowship',
        fellowship_type: 'Cardiology',
        country: 'United States',
      },
      [{ entryType: 'program', name: 'Mayo Clinic' }],
      4,
    );

    expect(highlights.summary).toContain('Fellowship');
    expect(highlights.savedItems).toBe(1);
    expect(highlights.savedPrograms).toBe(4);
    expect(highlights.nextAction).toContain('programs');
  });

  it('creates a short checklist of the next priority actions', () => {
    const actions = getNextActionChecklist(
      {
        primary_goal: 'fellowship',
        fellowship_type: 'Cardiology',
        country: 'United States',
      },
      [{ entryType: 'program', name: 'Mayo Clinic' }],
      2,
    );

    expect(actions).toHaveLength(3);
    expect(actions[0].title).toContain('Program');
    expect(actions[1].title).toContain('Notes');
  });
});
