export const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "SPA Backend API",
      version: "1.0.0",
      description: "API for SPA backend",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      responses: {
        ProfileDeletedForbidden: {
          description: "Access denied: Your account is deleted or pending deletion",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  code: {
                    type: "string",
                    example: "ACCOUNT_DELETED",
                  },
                  message: {
                    type: "string",
                    example: "Access denied: Your account is deleted or pending deletion",
                  },
                },
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./dist/routes/*.js", "./dist/modules/**/*.js","./src/routes/*.ts", "./src/modules/**/*.route.ts"],
};
