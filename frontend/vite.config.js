import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
 
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["globe.gl", "three-globe", "frame-ticker"],
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});
 