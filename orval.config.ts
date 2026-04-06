import { defineConfig } from "orval";

export default defineConfig({
  backend: {
    input: "../crash-reporter-backend/openapi/openapi.json",
    output: {
      target: "./lib/orval/backend.ts",
      client: "axios",
      mode: "tags-split",
      prettier: false
    }
  }
});
