module.exports = {
    testEnvironment: 'node',                  // Simulation d'environnement Node (pas navigateur)
    verbose: true,                            // Affiche les détails des tests dans la console
    colors: true,                             // Active la couleur dans les logs Jest
    runInBand: true,                          // Exécute les tests en série (utile pour DB partagée)
    detectOpenHandles: true,                  // Aide à détecter les promesses non résolues
    collectCoverage: true,                    // Active la couverture de code
    coverageDirectory: 'coverage',            // Où stocker les résultats
    coverageReporters: ['text', 'lcov', 'html'], // Formats des rapports
    coverageThreshold: {                      // Fait échouer si en-dessous des seuils
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
            pageTitle: 'API Test Report',
            outputPath: './coverage/test-report.html',
            includeFailureMsg: true,
            includeConsoleLog: true
        }]
    ]
};
