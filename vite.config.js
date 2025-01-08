import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "url";
import million from "million/compiler";

const srcPath = fileURLToPath(new URL("./src", import.meta.url));

export default defineConfig({
  optimizeDeps: {
    include: ["react-leaflet", "leaflet"],
  },
  plugins: [million.vite({ auto: true, mute: true }), react()],
  resolve: {
    alias: {
      "@": srcPath,
      "@assets": `${srcPath}/assets`,
      "@components": `${srcPath}/components`,
      "@layouts": `${srcPath}/layouts`,
      "@pages": `${srcPath}/pages`,
      "@api": `${srcPath}/state/api/reducer`,
      "@auth": `${srcPath}/state/auth/authReducer`,
      "@transaction": `${srcPath}/state/transaction/transactionReducer`,
      "@email": `${srcPath}/state/getCustomerEmail/emailReducer`,
    },
  },
  server: {
    port: 9999,
  },
});
