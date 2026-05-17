/** @type {import('jest').Config} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['<rootDir>/src/**/*.test.ts'],
    clearMocks: true,
    restoreMocks: true,
    setupFiles: ['dotenv/config'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    collectCoverageFrom: [
        '<rootDir>/src/modules/**/*.ts',
        '<rootDir>/src/shared/db/prisma.ts',
        '!<rootDir>/src/**/*.test.ts',
        '!<rootDir>/src/modules/products/ai-search-agent.service.ts',
        '!<rootDir>/src/modules/products/company-profile.service.ts',
        '!<rootDir>/src/modules/products/search-products.service.ts',
        '!<rootDir>/src/modules/products/search-products.dto.ts',
        '!<rootDir>/src/modules/**/auth.routes.ts',
        '!<rootDir>/src/modules/**/orders.routes.ts',
        '!<rootDir>/src/modules/**/products.routes.ts',
    ],
    coveragePathIgnorePatterns: [
        '/node_modules/',
        '<rootDir>/src/generated/',
        '<rootDir>/src/shared/swagger/',
        '<rootDir>/src/modules/products/ai-search-agent.service.ts',
        '<rootDir>/src/modules/products/company-profile.service.ts',
        '<rootDir>/src/modules/products/search-products.service.ts',
        '<rootDir>/src/modules/products/search-products.dto.ts',
    ],
    coverageThreshold: {
        global: {
            lines: 80,
            functions: 80,
            branches: 80,
            statements: 80,
        },
    },
};
