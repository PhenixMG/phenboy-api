module.exports = {
    testEnvironment: 'node',
    verbose: true,
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
        }
    },
    reporters: [
        'default',
        ['jest-html-reporter', {
            pageTitle: 'PhenixMG API Test Report',
            outputPath: './coverage/test-report.html',
            includeFailureMsg: true,
            includeConsoleLog: true
        }]
    ]
};
