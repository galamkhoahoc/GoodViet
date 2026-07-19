import { describe, expect, it } from 'vitest';
import { phaseIISentences, phaseIIIPrompts, phaseISentences } from './mockAssessment';
import { practiceLessons } from './mockPractice';
import { assessmentApi } from '../services/api/assessmentApi';
import { practiceApi } from '../services/api/practiceApi';

describe('GOODVIET assessment mock data', () => {
  it('contains all 15 scripted sentences and 5 storytelling prompts', () => {
    expect(phaseISentences).toHaveLength(10);
    expect(phaseIISentences).toHaveLength(5);
    expect(phaseIIIPrompts).toHaveLength(5);
    expect(new Set([...phaseISentences, ...phaseIISentences].map(({ id }) => id)).size)
      .toBe(15);
  });

  it('runs through the three mock assessment phases and returns a result', async () => {
    const started = await assessmentApi.startAssessment();
    expect(started.sentences).toHaveLength(10);

    const phaseTwo = await assessmentApi.completePhase(started.assessmentId, 'phase_1');
    expect(phaseTwo.nextPhase).toBe('phase_2');
    expect(phaseTwo.sentences).toHaveLength(5);

    const phaseThree = await assessmentApi.completePhase(started.assessmentId, 'phase_2');
    expect(phaseThree.nextPhase).toBe('phase_3');
    expect(phaseThree.sentences).toHaveLength(5);

    await assessmentApi.completePhase(started.assessmentId, 'phase_3');
    expect(await assessmentApi.getStatus(started.assessmentId)).toEqual({ status: 'completed' });
    expect((await assessmentApi.getResult()).overallScore).toBeGreaterThan(0);
  });
});

describe('GOODVIET practice mock data', () => {
  it('contains 10 complete lessons with 3 short and 3 long exercises each', () => {
    expect(practiceLessons).toHaveLength(10);
    expect(new Set(practiceLessons.map(({ id }) => id)).size).toBe(10);
    practiceLessons.forEach((lesson) => {
      expect(lesson.shortSentences).toHaveLength(3);
      expect(lesson.longPassages).toHaveLength(3);
      expect(lesson.goal.length).toBeGreaterThan(20);
    });
  });

  it('serves a lesson through the mock practice API', async () => {
    const content = await practiceApi.getDayExercises(1, 1);
    expect(content.isRestDay).toBe(false);
    expect(content.exercises).toHaveLength(2);
    expect(content.exercises.flatMap(({ sentences }) => sentences ?? [])).toHaveLength(6);
  });
});
