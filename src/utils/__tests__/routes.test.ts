import { describe, test, expect } from 'vitest';
import * as fixtures from '../__fixtures__/routes.fixtures.js';
import * as routesUtils from '../routes.js';

describe('routes utils', () => {
  fixtures.parseBatch.forEach(fixture => {
    test(`parseBatch`, () => {
      expect(routesUtils.parseBatch(fixture.batch)).toStrictEqual(fixture.result);
    });
  });
});
