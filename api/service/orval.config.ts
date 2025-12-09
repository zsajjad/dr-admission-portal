import { createRequire } from 'module';

import { defineConfig } from 'orval';

const require = createRequire(import.meta.url);
const configs = require('./api.config.json');

const disabledTags = ['/health', '/metrics'];
const includeTags: string[] = [];
const requiredTags: string[] = [];

export default defineConfig({
  service: {
    output: {
      mode: 'tags-split',
      target: '../../src/providers/service/app.ts',
      client: 'react-query',
      mock: false,
      prettier: true,
      override: {
        mutator: {
          path: '../../src/services/index.ts',
          default: true,
          name: 'service',
        },
        query: {
          useQuery: true,
          useInfinite: false,
        },
        operations: {},
      },
    },
    input: {
      target: {
        ...configs,
        paths: Object.keys(configs.paths)
          .filter((v) => {
            if (requiredTags.length) {
              return requiredTags.some((t) => v.startsWith(t));
            }
            const included = includeTags.map((a) => v.startsWith(a)).includes(true);
            const disabled = disabledTags.map((a) => v.includes(a)).includes(true);
            return included || !disabled;
          })
          .reduce(
            (acc, cur) => {
              acc[cur] = configs.paths[cur];
              return acc;
            },
            {} as typeof configs.paths,
          ),
      },
      override: {
        transformer: '../transformers/fix-array-items.js',
      },
    },
  },
});
