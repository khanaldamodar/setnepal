import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL") || "mysql://shaktate_deepak:Deepak121%40@s9943.sgp1.stableserver.net:3306/shaktate_setnepal"
  },
  
});
