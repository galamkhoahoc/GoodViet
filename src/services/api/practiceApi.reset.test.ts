import { describe, expect, it } from 'vitest';
import { practiceApi } from './practiceApi';

describe('practiceApi temporary reset', () => {
  it('returns zero mock progress after reset', async () => {
    practiceApi.resetMockState();

    const progress = await practiceApi.getProgress();
    const { history } = await practiceApi.getHistory();

    expect(progress.currentStreak).toBe(0);
    expect(progress.completedSessions).toBe(0);
    expect(progress.completionPercentage).toBe(0);
    expect(history).toEqual([]);
  });

  it('does not let an older in-flight check-in repopulate reset history', async () => {
    const checkin = practiceApi.checkin(1, 1, 2);
    practiceApi.resetMockState();
    await checkin;

    const { history } = await practiceApi.getHistory();
    expect(history).toEqual([]);
  });
});
