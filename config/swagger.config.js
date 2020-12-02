const swaggerJsDoc = require('swagger-jsdoc');

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: "Cloud Drive API",
            version: '1.0.0',
            description: "REST API for Cloud Drive web app",
            // servers: ["http://localhost:3000"]

        },
        servers: [
            {
                "url":"http://localhost:3000",
                "description":"Development Server"
            },
            {
                "url":"https://cloudrive.digital",
                "description":"Prod Server"
            }
        ],
        // components: {
        //     "securitySchemes": {
        //         "ApiKeyAuth": { //arbitrary name for the security scheme
        //             "type": "apiKey",
        //             "name": "Authorization", // name of the header, query parameter or cookie
        //             "in": "header", // can be "header", "query" or "cookie"
        //         }
        //     }
        // }
    },
    apis: ["index.js", "./src/routes/*.route.js"]
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = swaggerDocs;