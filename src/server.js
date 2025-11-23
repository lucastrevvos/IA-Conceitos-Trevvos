import "dotenv/config";
import express from "express";
import cors from "cors";

import { env } from "./core/config/env.js";
import { requestId } from "./core/http/middlewares/requestId.js";
import { logger } from "./core/logger.js";

import { logging } from "./core/http/middlewares/logging.js";
import { errorHandler } from "./core/http/middlewares/errorHandler.js";

import { v1Router } from "./http/routes/v1/index.js";

const app = express();

app.use(requestId);
app.use(logging);

app.use(cors());
app.use(express.json());

//Health check
app.get("/", (req, res) => {
  return res.json({
    status: "ok",
    message: "Trevvos IA API está no ar",
    requestId: req.requestId,
  });
});

app.use("/v1", v1Router);

app.use(errorHandler);

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  logger.info("Servidor HTTP iniciado", { port: PORT });
  console.log(`Server running at http://localhost:${PORT}`);
});
