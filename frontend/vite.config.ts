import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [react()],

    // Reason: Docker + nginx expect dev server on 3000 (see docker-compose / frontend Dockerfile).
    server: {
      port: 3000,
      host: true,
      // Reason: Nginx forwards Host (e.g. ieaccount.com); Vite 6 blocks unknown hosts by default.
      allowedHosts: true,
    },

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        global: path.resolve(__dirname, "./src/globals.js"),
      },
    },

    define: {
      global: "window",
      "process.env.NODE_ENV": JSON.stringify(mode),
      "process.env.VITE_API_URL": JSON.stringify(env.VITE_API_URL),
    },

    build: {
      outDir: "dist",
      sourcemap: false,
      minify: "esbuild",
      chunkSizeWarningLimit: 1000,
    },
  };
});
