// server/routes/content.js
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper: safely locate your JSON files
const dataDir = path.resolve(__dirname, "../../data");

router.get("/:type", (req, res) => {
  const file = path.join(dataDir, `${req.params.type}.json`);
  if (!fs.existsSync(file)) return res.status(404).json({ error: "Not found" });

  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  res.json(data);
});

router.post("/:type", (req, res) => {
  const file = path.join(dataDir, `${req.params.type}.json`);
  fs.writeFileSync(file, JSON.stringify(req.body, null, 2));
  res.json({ success: true });
});

export default router;
