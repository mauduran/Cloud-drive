const swaggerJsDoc = require('swagger-jsdoc');

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: "Cloud Drive API",
            version: '1.0.0',
            description: "REST API for Cloud Drive web app",
            servers: ["http://localhost:3000"]
        },
    },
    apis: ["index.js", "./src/routes/*.route.js"]
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = swaggerDocs;