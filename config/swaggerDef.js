// config/swaggerDef.js
module.exports = {
    openapi: '3.0.0',
    info: {
        title: 'Phenboy API',
        version: '1.0.0',
        description: 'API du projet Phenboy pour la gestion de serveurs Discord'
    },
    servers: [
        {
            url: 'http://localhost:3000',
            description: 'Serveur de développement'
        }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            }
        }
    },
    security: [{ bearerAuth: [] }]
};
