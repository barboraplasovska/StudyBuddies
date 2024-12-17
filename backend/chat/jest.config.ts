import type {Config} from 'jest';

const config: Config = {
    verbose: true,
    preset: 'ts-jest',
    reporters: [
        "default",
        ["jest-junit", { "outputName": "test-results.xml" }]
    ],
    roots: [
        "<rootDir>/tests",
    ],
    moduleDirectories: ['<rootDir>/src', 'node_modules'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest'
    },
    testMatch: [
        "**/tests/**/*.test.ts"
    ],
    moduleNameMapper: {
        '^domain/(.*)$': '<rootDir>/src/domain/$1',
        '^infrastructure/(.*)$': '<rootDir>/src/infrastructure/$1',
        '^presentation/(.*)$': '<rootDir>/src/presentation/$1',
        '^utils/(.*)$': '<rootDir>/src/utils/$1',
        '^types/(.*)$': '<rootDir>/src/types/$1',
    },
    testEnvironment: 'node',
    collectCoverage: true,
    coverageReporters: ["cobertura", "html", "text"],
    setupFilesAfterEnv: ['./jest.setup.ts'],
};

export default config;