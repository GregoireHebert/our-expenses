import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://our-expenses.gheb.dev",
  // "file" output means GitHub Pages serves /privacy as a plain 200 instead of
  // redirecting it to /privacy/.
  build: { format: "file" },
});
