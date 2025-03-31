import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import tsconfigPaths from "vite-tsconfig-paths"; // Import the plugin

// https://vite.dev/config/
export default defineConfig({
  // Add tsconfigPaths() to the plugins array
  plugins: [react(), tailwindcss(), tsconfigPaths()],
});
