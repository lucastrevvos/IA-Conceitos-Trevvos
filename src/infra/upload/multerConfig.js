// src/infra/upload/multerConfig.js
import multer from "multer";
import path from "node:path";
import fs from "node:fs";

const uploadFolder = path.resolve("uploads");

// garante que a pasta existe
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);

    cb(null, `${base}-${timestamp}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Tipo de arquivo não suportado. Envie PDF ou DOCX."));
    }

    cb(null, true);
  },
});
