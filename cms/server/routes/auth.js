// server/routes/auth.js
import express from "express";
const router = express.Router();

router.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (
    username === process.env.ADMIN_USER &&
    password === process.env.ADMIN_PASS
  ) {
    return res.json({ success: true, token: "admin-session" });
  }
  res.status(401).json({ success: false });
});

router.post("/logout", (req, res) => {
  res.json({ success: true });
});

export default router;
