import { defineConfig } from "prisma";

export default defineConfig({
  datasource: {
    url: () => process.env.DATABASE_URL || "",
  },
  migrate: {
    url: () => process.env.DIRECT_URL || process.env.DATABASE_URL || "",
  },
});
