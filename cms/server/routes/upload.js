// cms/server/routes/upload.js
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// Create an "uploads" folder if it doesn't exist
const uploadDir = path.join(process.cwd(), "cms", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Configure multer (handles file uploads)
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// POST /api/upload
router.post("/", upload.single("file"), (req, res) => {
  const publicPath = `/cms/uploads/${req.file.filename}`;
  res.json({ url: publicPath });
});

export default router;
