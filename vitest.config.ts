// eslint-disable-next-line import/extensions
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['./test/unit/tests/**/*.test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
});
