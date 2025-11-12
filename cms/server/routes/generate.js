// cms/server/routes/generate.js
import express from "express";
import fs from "fs";
import path from "path";
import slugify from "slugify";

const router = express.Router();

// helper: ensure folders exist
function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// helper: create slug
function makeSlug(title) {
  return slugify(title, { lower: true, strict: true });
}

// ========== PRODUCT PAGE GENERATOR ==========
router.post("/product", (req, res) => {
  const { title, image, description, price, stripeUrl, isSold } = req.body;
  if (!title) return res.status(400).json({ error: "Missing title" });

  const slug = makeSlug(title);
  const folder = path.resolve(process.cwd(), "pubweb", "products");
  ensureDir(folder);

  const filePath = path.join(folder, `${slug}.html`);

  const soldBadge = isSold
    ? `<span class="badge sold-out">SOLD OUT</span>`
    : "";

  const buyButton = isSold
    ? `<button class="buy-btn disabled" disabled>Unavailable</button>`
    : stripeUrl
    ? `<a href="${stripeUrl}" class="buy-btn">Buy on Stripe</a>`
    : "";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <link rel="stylesheet" href="/css/main.css" />
</head>
<body>
  <main class="product-page">
    <div class="product-header">
      <h1>${title}</h1>
      ${soldBadge}
    </div>
    ${image ? `<img src="${image}" alt="${title}" class="product-image">` : ""}
    <p class="desc">${description || ""}</p>
    ${price ? `<p class="price">$${price}</p>` : ""}
    ${buyButton}
  </main>
</body>
</html>
`;

  fs.writeFileSync(filePath, html);
  res.json({
    success: true,
    slug,
    pageUrl: `/products/${slug}.html`
  });
});


// ========== DOWNLOAD PAGE GENERATOR ==========
router.post("/download", (req, res) => {
  const { title, downloadFile } = req.body;
  if (!title) return res.status(400).json({ error: "Missing title" });

  const slug = makeSlug(title);
  const folder = path.resolve(process.cwd(), "pubweb", "downloads");
  ensureDir(folder);

  const filePath = path.join(folder, `${slug}.html`);
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Download: ${title}</title>
  <link rel="stylesheet" href="/css/main.css" />
</head>
<body>
  <main class="download-page">
    <h1>Thank you for purchasing ${title}!</h1>
    ${
      downloadFile
        ? `<a href="${downloadFile}" class="download-btn">Download your file</a>`
        : `<p>No file attached yet.</p>`
    }
  </main>
</body>
</html>
`;

  fs.writeFileSync(filePath, html);
  res.json({
    success: true,
    slug,
    downloadUrl: `/downloads/${slug}.html`
  });
});

export default router;
