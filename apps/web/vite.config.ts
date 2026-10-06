/**
 * ==============================================================================
 * Vite Build Configuration for React SPA
 *
 * Traceability:
 *   - ADR-TECH-01: React + TypeScript built via Vite
 *   - ADR-DEPLOY-01: Static build output compatible with any CDN/PaaS
 * ==============================================================================
 */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173 // Matches FRONTEND_ORIGIN configured in backend .env
  }
});