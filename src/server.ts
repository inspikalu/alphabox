import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { config } from "./config.js";

import { intelRouter } from "./routes/intel.js";
import { vaultRouter } from "./routes/vault.js";

export const app: express.Express = express();

app.use(cors());
app.use(express.json());

app.use("/api/intel", intelRouter);
app.use("/api/vault", vaultRouter);

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "AlphaBox x402 Server",
    version: "0.1.0"
  });
});

export function startServer(port: number = config.PORT) {
  return app.listen(port, () => {
    process.stdout.write(`[AlphaBox] Server listening on port ${port}\n`);
  });
}

// Start server if executed directly
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  startServer();
}
