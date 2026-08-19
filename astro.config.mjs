import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://wblazer.github.io/state-of-animal-welfare",
  base: "/state-of-animal-welfare",
  output: "static",
  build: {
    assets: "assets",
    inlineStylesheets: "never",
  },
});
