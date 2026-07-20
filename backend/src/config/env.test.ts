describe('API_BASE_URL validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      MONGODB_URI: 'mongodb://127.0.0.1:27017/goodviet_test',
      JWT_SECRET: 'test-only-jwt-secret-at-least-32-characters',
    };
    delete process.env.API_BASE_URL;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  function loadEnv() {
    let loaded: typeof import('./env').env | undefined;
    jest.isolateModules(() => {
      loaded = require('./env').env;
    });
    return loaded!;
  }

  it.each(['staging', 'production'])('requires the public origin in %s', (nodeEnv) => {
    process.env.NODE_ENV = nodeEnv;
    expect(loadEnv).toThrow('API_BASE_URL is required');
  });

  it.each([
    'http://api.example.test',
    'HTTP://api.example.test',
  ])('requires HTTPS in production for %s', (apiBaseUrl) => {
    process.env.NODE_ENV = 'production';
    process.env.API_BASE_URL = apiBaseUrl;
    expect(loadEnv).toThrow('API_BASE_URL must use HTTPS in production');
  });

  it('accepts and normalizes an HTTPS production origin', () => {
    process.env.NODE_ENV = 'production';
    process.env.API_BASE_URL = 'https://api.example.test///';

    expect(loadEnv().API_BASE_URL).toBe('https://api.example.test');
  });
});
