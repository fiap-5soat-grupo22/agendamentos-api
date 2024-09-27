import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  verbose: false,
  silent: false,
  collectCoverageFrom: [
    'src/usecases/*/*.service.ts',
    'src/usecases/*/*.controller.ts',
    'src/infrastructure/repositories/*/*.repository.ts',
  ],
  testPathIgnorePatterns: [],
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/'],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
};
export default config;
