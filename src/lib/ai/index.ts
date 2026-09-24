import { IAIProvider } from './types';
import { MockAIProvider } from './mock-provider';
import { OpenAIProvider } from './openai-provider';

export * from './types';

export function getAIProvider(): IAIProvider {
  const providerType = process.env.AI_PROVIDER || 'mock';
  if (providerType === 'openai') {
    return new OpenAIProvider();
  }
  return new MockAIProvider();
}
