import { defineConfig } from "orval";

const apiBaseUrl =
  process.env.ORVAL_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:5001/api";

export default defineConfig({
  secretSantaApi: {
    input: {
      target: `${apiBaseUrl}/openapi.json`,
    },
    output: {
      target: "./src/lib/api/generated/client.ts",
      client: "fetch",
      clean: true,
      baseUrl: apiBaseUrl,
      override: {
        fetch: {
          includeHttpResponseReturnType: false,
        },
      },
    },
  },
});
