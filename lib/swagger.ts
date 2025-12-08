import { createSwaggerSpec } from "next-swagger-doc";

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: "app/api", // folder where all API routes are located
    definition: {
      openapi: "3.0.0",
      info: {
        title: "SetNepal API Documentation",
        version: "1.0",
        description: "Auto-generated Swagger documentation for SetNepal APIs.",
      },
      servers: [
        {
          url: "https://setnepal.com",
          description: "Local development server",
        },
        {
          url: "https://setnepal.com",
          description: "Production server",
        },
      ],
      components: {
        securitySchemes: {
          BearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
      security: [{ BearerAuth: [] }],
    },
    // optional: patterns to exclude files if needed
    exclude: ["**/tests/**", "**/*.spec.ts"],
  });

  return spec;
};
