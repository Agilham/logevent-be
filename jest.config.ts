import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/dist/', '/node_modules/'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['lcov', 'text'],
  reporters: [
    'default',
    ['jest-sonar', {
      outputDirectory: 'coverage',
      outputName: 'sonar-report.xml',
    }],
  ],
};

export default config;
