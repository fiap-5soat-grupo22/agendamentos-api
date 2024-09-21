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
      statements: 90,
      branches: 60,
      functions: 90,
      lines: 90,
    },
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
};
export default config;
