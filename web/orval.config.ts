import { defineConfig } from "orval";

export default defineConfig({
  secretSantaApi: {
    input: {
      target: "http://localhost:5001/api/openapi.json",
    },
    output: {
      target: "./src/lib/api/generated/client.ts",
      client: "fetch",
      clean: true,
      override: {
        fetch: {
          includeHttpResponseReturnType: false,
        },
      },
    },
  },
});
