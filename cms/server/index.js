// server/index.js
import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import stripePkg from "stripe";

import authRoutes from "./routes/auth.js";
import contentRoutes from "./routes/content.js";
import uploadRoute from "./routes/upload.js"; // ✅ add this line
import generateRoutes from "./routes/generate.js";
app.use("/api/generate", generateRoutes);


// ========== ENVIRONMENT SETUP ==========
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const stripe = stripePkg(process.env.STRIPE_SECRET_KEY);
const app = express();

app.use(cors());
app.use(bodyParser.json());

// ========== STATIC FRONTEND (optional) ==========
// If you have your CMS or site HTML in the project root or /public folder,
// this allows it to be served directly via http://localhost:4000/cms.html etc.
app.use(express.static(path.resolve(process.cwd())));

// ========== ROUTES ==========
app.use("/api", authRoutes);            // handles /api/login, /api/logout
app.use("/api/content", contentRoutes); // handles /api/content/:type
app.use("/api/upload", uploadRoute);    // ✅ add this line

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
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ========== FALLBACK ROUTE ==========
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ========== SERVER START ==========
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`✅ CMS API running on http://localhost:${PORT}`);
});
