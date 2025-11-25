import { Router } from "express";
import { createRateLimiter } from "../../../core/http/middlewares/rateLimiter.js";
import { summaryController } from "../../controllers/summaryController.js";
import { uploadRouter } from "./uploadRoutes.js";
import { ragRouter } from "./ragRoutes.js";

const router = Router();

const chatRateLimiter = createRateLimiter({
  maxRequests: 30,
  windowMs: 60 * 1000,
});

const resumoRateLimiter = createRateLimiter({
  maxRequests: 20,
  windowMs: 60 * 1000,
});

router.post("/chat", chatRateLimiter, (req, res, next) =>
  summaryController.handle(req, res, next),
);

router.post("/resumo", resumoRateLimiter, (req, res, next) =>
  summaryController.handle(req, res, next),
);

router.use("/upload", uploadRouter);

router.use("/rag", ragRouter);

export const v1Router = router;
