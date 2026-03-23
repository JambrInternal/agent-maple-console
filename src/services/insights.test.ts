import { describe, expect, it } from 'vitest';
import { getInsights } from './insights';

describe('insights service', () => {
  it('throws until the API exists', async () => {
    await expect(getInsights('proj_1', '30d')).rejects.toThrow('Insights are not available yet');
  });
});
