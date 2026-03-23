import { MockProvider } from './mock.provider.js';
import { TwilioProvider } from './twilio.provider.js';
import { MetaProvider } from './meta.provider.js';

const mockProvider = new MockProvider();
const twilioProvider = new TwilioProvider();
const metaProvider = new MetaProvider();

export function getProvider(workspace) {
  const provider = workspace?.whatsappProvider || 'mock';

  if (provider === 'mock') return mockProvider;
  if (provider === 'twilio') return twilioProvider;
  if (provider === 'meta') return metaProvider;

  throw new Error(`Provider ${provider} is not implemented yet. Use mock for now.`);
}
