import { Router } from "express";

import { createRateLimiter } from "../../../core/http/middlewares/rateLimiter.js";
import { upload } from "../../../infra/upload/multerConfig.js";
import { uploadController } from "../../controllers/uploadController.js";

const router = Router();

const uploadRateLimiter = createRateLimiter({
  maxRequests: 10,
  windowMs: 60 * 1000,
});

router.post(
  "/document",
  uploadRateLimiter,
  upload.single("file"),
  (req, res, next) => uploadController.handleDocument(req, res, next),
);

export const uploadRouter = router;
