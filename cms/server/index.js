// server/index.js
import express from "express";
import path from "path";
import cors from "cors";
import bodyParser from "body-parser";

// Routes
import authRoutes from "./routes/auth.js";
import contentRoutes from "./routes/content.js";
import uploadRoute from "./routes/upload.js";
import generateRoutes from "./routes/generate.js";

// ===== ENV + STRIPE SETUP (clean) =====
import "dotenv/config";          // loads .env from current working dir
import Stripe from "stripe";

const rawKey = (process.env.STRIPE_SECRET_KEY || "").trim();
if (!rawKey) {
  console.error("❌ STRIPE_SECRET_KEY missing from .env");
}
console.log("🔑 Stripe key prefix:", rawKey.slice(0, 7)); // should be sk_test or sk_live

const stripe = new Stripe(rawKey);

// ===== APP =====
const app = express();
app.use(cors());                 // optionally: cors({ origin: ["http://localhost:4000"] })
app.use(bodyParser.json());

// Serve static files from project root (so /cms.html works)
app.use(express.static(path.resolve(process.cwd())));

// ===== ROUTES =====
app.use("/api", authRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/upload", uploadRoute);
app.use("/api/generate", generateRoutes);

// ===== STRIPE LINK GENERATOR =====
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

    // Create Product + Price (you can reuse these later if you want)
    const product = await stripe.products.create({ name });
    const priceObj = await stripe.prices.create({
      product: product.id,
      unit_amount: unitAmount,
      currency: "usd",
    });

    const afterCompletion = redirectUrl
      ? { type: "redirect", redirect: { url: redirectUrl } }
      : undefined;

    const link = await stripe.paymentLinks.create({
      line_items: [{ price: priceObj.id, quantity: 1 }],
      after_completion: afterCompletion,
      // allow_promotion_codes: true,
    });

    return res.json({ success: true, url: link.url });
  } catch (err) {
    console.error("Stripe error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ===== FALLBACK =====
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ===== START =====
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`✅ CMS API running on http://localhost:${PORT}`);
});
