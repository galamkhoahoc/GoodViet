import {
  GOODVIET_ASSISTANT_SYSTEM_PROMPT,
  GOODVIET_FEATURES,
  SENTENCE_EVALUATION_SYSTEM_PROMPT,
  getAssistantSystemPrompt,
  getNavigationFallback,
} from './assistantPrompts';

describe('assistant prompts', () => {
  it('keeps every GoodViet route in the assistant feature map', () => {
    for (const feature of GOODVIET_FEATURES) {
      expect(GOODVIET_ASSISTANT_SYSTEM_PROMPT).toContain(feature.path);
      expect(GOODVIET_ASSISTANT_SYSTEM_PROMPT).toContain(feature.navigationLabel);
    }
  });

  it('selects an isolated prompt for each assistant context', () => {
    expect(getAssistantSystemPrompt('goodviet-assistant')).toBe(GOODVIET_ASSISTANT_SYSTEM_PROMPT);
    expect(getAssistantSystemPrompt('sentence-evaluation')).toBe(SENTENCE_EVALUATION_SYSTEM_PROMPT);
    expect(getAssistantSystemPrompt('unknown')).toBeUndefined();
  });

  it('returns a direct pathway link for a navigation question', () => {
    expect(getNavigationFallback('Lộ trình luyện tập ở đâu?')).toContain('(/pathway)');
  });

  it('normalizes uppercase Vietnamese letters in navigation questions', () => {
    expect(getNavigationFallback('Đổi múi giờ ở đâu?')).toContain('(/settings)');
  });

  it('does not turn ordinary coaching questions into navigation answers', () => {
    expect(getNavigationFallback('Tôi thấy hơi lo khi phải thuyết trình.')).toBeNull();
  });
});
