export const goodVietIllustrations = {
  practiceHero: '/images/goodviet-practice-hero-v2.webp',
  voiceCheck: '/images/goodviet-voice-check.webp',
  learningPath: '/images/goodviet-learning-path.webp',
  aiSupport: '/images/goodviet-ai-support.webp',
  expertCoaching: '/images/goodviet-expert-coaching.webp',
  dailyRoutine: '/images/goodviet-daily-routine.webp',
} as const;

export type GoodVietIllustration = keyof typeof goodVietIllustrations;
