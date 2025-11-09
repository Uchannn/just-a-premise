// server/index.js
import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";
import bodyParser from "body-parser";
import stripePkg from "stripe";
import dotenv from "dotenv";

dotenv.config();
const stripe = stripePkg(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Helper to resolve paths
const resolvePath = (file) => path.join(process.cwd(), file);

// ========== AUTH ROUTES ==========
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (
    username === process.env.ADMIN_USER &&
    password === process.env.ADMIN_PASS
  ) {
    return res.json({ success: true, token: "admin-session" });
  }
  res.status(401).json({ success: false });
});

// ========== JSON READ/WRITE ==========
app.get("/api/content/:type", (req, res) => {
  const type = req.params.type;
  const file = resolvePath(`data/${type}.json`);
  if (!fs.existsSync(file)) return res.status(404).json({ error: "Not found" });

  const content = JSON.parse(fs.readFileSync(file, "utf-8"));
  res.json(content);
});

app.post("/api/content/:type", (req, res) => {
  const type = req.params.type;
  const file = resolvePath(`data/${type}.json`);
  fs.writeFileSync(file, JSON.stringify(req.body, null, 2));
  res.json({ success: true });
});

// ========== STRIPE LINK GENERATOR ==========
app.post("/api/stripe/create-link", async (req, res) => {
  const { name, price } = req.body;
  try {
    const product = await stripe.products.create({ name });
    const priceObj = await stripe.prices.create({
      product: product.id,
      unit_amount: price * 100,
      currency: "usd",
    });
    const link = await stripe.paymentLinks.create({
      line_items: [{ price: priceObj.id, quantity: 1 }],
    });
    res.json({ success: true, url: link.url });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: e.message });
  }
});

app.listen(4000, () => console.log("CMS API running on http://localhost:4000"));
