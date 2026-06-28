import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  root: "src",
  publicDir: resolve(__dirname, "public"),
  server: {
    open: "/pages/index.html",
    port: 3000,
    strictPort: true,
    allowedHosts: [".ngrok-free.app", ".ngrok.io"],
  },
  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        home: resolve(__dirname, "src/pages/index.html"),
        about: resolve(__dirname, "src/pages/about-us.html"),
        menu: resolve(__dirname, "src/pages/menu.html"),
        gallery: resolve(__dirname, "src/pages/gallery.html"),
        contact: resolve(__dirname, "src/pages/contact-us.html"),
        qr: resolve(__dirname, "src/pages/qr-code.html"),
      },
    },
  },
});
