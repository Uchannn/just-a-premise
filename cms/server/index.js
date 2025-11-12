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
import uploadRoute from "./routes/upload.js";
import generateRoutes from "./routes/generate.js"; // ✅ this must be below imports, not mid-code



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
app.use("/api/generate", generateRoutes);

// ========== STRIPE LINK GENERATOR ==========
app.post("/api/stripe/create-link", async (req, res) => {
  try {
    const { name, price, redirectUrl } = req.body;
    if (!name || price == null) {
      return res.status(400).json({ success: false, error: "Missing name or price" });
    }

    const unitAmount = Math.round(Number(price) * 100);
    if (!Number.isFinite(unitAmount) || unitAmount <= 0) {
      return res.status(400).json({ success: false, error: "Invalid price" });
    }

    // Create (or you could reuse) a Product and Price
    const product = await stripe.products.create({ name });
    const priceObj = await stripe.prices.create({
      product: product.id,
      unit_amount: unitAmount,
      currency: "usd",
    });

    // Build after_completion only if we have a redirectUrl
    const afterCompletion = redirectUrl
      ? { type: "redirect", redirect: { url: redirectUrl } }
      : undefined;

    const link = await stripe.paymentLinks.create({
      line_items: [{ price: priceObj.id, quantity: 1 }],
      after_completion: afterCompletion,
      // allow_promotion_codes: true, // optional
    });

    return res.json({ success: true, url: link.url });
  } catch (err) {
    console.error("Stripe error:", err);
    return res.status(500).json({ success: false, error: err.message });
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
