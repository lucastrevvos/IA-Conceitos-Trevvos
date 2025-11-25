import { Router } from "express";
import { ragController } from "../../controllers/ragController.js";
import { createRateLimiter } from "../../../core/http/middlewares/rateLimiter.js";

const router = Router();

const ragRateLimiter = createRateLimiter({
  maxRequests: 30,
  windowMs: 60 * 1000,
});

router.post("/query", ragRateLimiter, (req, res, next) =>
  ragController.query(req, res, next),
);

export const ragRouter = router;
