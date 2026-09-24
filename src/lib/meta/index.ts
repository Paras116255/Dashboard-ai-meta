import { IMetaProvider } from './types';
import { MockMetaProvider } from './mock-provider';
import { RealMetaProvider } from './real-provider';

export * from './types';
export * from './capabilities';

export function getMetaProvider(accessToken?: string): IMetaProvider {
  const useMock = process.env.USE_MOCK_META_API !== 'false' || !accessToken;
  if (useMock) {
    return new MockMetaProvider();
  }
  return new RealMetaProvider(accessToken);
}
