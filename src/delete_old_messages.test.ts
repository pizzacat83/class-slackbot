import { evalOnGAS } from './test-util';

declare const deleteOldMessages: () => void;
declare const listMessages: (
  channel: string,
  option?: { latest?: string | number; oldest?: string | number }
) => any[];

describe('deleteOldMessages', () => {
  beforeAll(async () => {
    jest.setTimeout(1000 * 20);
  });

  it('deletes all messages older than 1 day', async () => {
    const now = Date.now() / 1000;
    const messages: any[] = await evalOnGAS(function() {
      deleteOldMessages();
      return listMessages(PropertiesService.getScriptProperties().getProperty('seashore-id'));
    });
    expect(messages).toBeInstanceOf(Array);
    for (const message of messages) {
      if (parseFloat(message.ts) < now - 60 * 60 * 24) {
        expect(message.pinned_to).toBeTruthy();
      }
    }
  });
});
