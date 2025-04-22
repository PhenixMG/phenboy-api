module.exports = {
    testEnvironment: 'node',
    verbose: true,
    colors: true,
    runInBand: true,
    detectOpenHandles: true,
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
        }
    },
    // Si tu utilises un reporter HTML :
    reporters: [
        'default',
        ['jest-html-reporter', {
            pageTitle: 'API Test Report',
            outputPath: './coverage/test-report.html',
            includeFailureMsg: true,
            includeConsoleLog: true
        }]
    ]
};
