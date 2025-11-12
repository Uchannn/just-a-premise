// js/cms-shop.js
// Controls the Just a Premise CMS Shop editor interface

const shopList = document.getElementById("shop-list");
const saveBtn = document.getElementById("save-btn");
const addBtn = document.getElementById("add-btn");
const addBtnMobile = document.getElementById("add-item-mobile");

let products = [];

// ===== FETCH SHOP DATA =====
async function loadShop() {
  try {
    const res = await fetch("/api/content/shop");
    if (!res.ok) throw new Error("Failed to load shop data");
    products = await res.json();
    renderShop();
  } catch (err) {
    console.error("Error loading shop:", err);
    shopList.innerHTML = `<p style="color:red;">Failed to load shop.json</p>`;
  }
}

// ===== RENDER SHOP LIST =====
function renderShop() {
  shopList.innerHTML = "";
  if (!products.length) {
    shopList.innerHTML = `<p style="color:#666;">No listings yet. Add one below.</p>`;
    return;
  }

  products.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${item.title || "Untitled Product"}</h3>

      <div class="card-body open">
        <label>Title</label>
        <input type="text" data-index="${index}" data-key="title" value="${item.title || ""}">

        <label>Price (USD)</label>
        <input type="number" step="0.01" data-index="${index}" data-key="price" value="${item.price ?? ""}">

        <label>Image</label>
        <div class="upload-box image-upload" data-index="${index}" data-key="image">
          ${
            item.image
              ? `<img src="${item.image}" alt="" class="preview">`
              : `<p class="drop-zone">Drag & drop or click to upload</p>`
          }
          <input type="file" accept="image/*" hidden>
        </div>

        <label>Digital File (what the buyer downloads)</label>
        <div class="upload-box file-upload" data-index="${index}" data-key="downloadFile">
          ${
            item.downloadFile
              ? `<p class="file-chip">${(item.downloadFile.split('/').pop())}</p>`
              : `<p class="drop-zone">Drag & drop or click to upload</p>`
          }
          <input type="file" hidden>
        </div>

        <label>Description</label>
        <textarea rows="3" data-index="${index}" data-key="description">${item.description || ""}</textarea>

        <label>Category</label>
        <input type="text" data-index="${index}" data-key="category" value="${item.category || ""}">

        <label>Tags (comma-separated)</label>
        <input type="text" data-index="${index}" data-key="tags" value="${(item.tags || []).join(", ")}">

        <label>Stripe Link</label>
        <input type="text" data-index="${index}" data-key="stripeUrl" value="${item.stripeUrl || ""}">

        <label>
          <input type="checkbox" data-index="${index}" data-key="isAdult" ${item.isAdult ? "checked" : ""}> Adult Content
        </label>

        <label>
          <input type="checkbox" data-index="${index}" data-key="isSold" ${item.isSold ? "checked" : ""}> Sold Out
        </label>

        <div class="row-btns">
          <button class="gen-product" data-index="${index}">Generate Product Page</button>
          <button class="gen-download" data-index="${index}">Generate Download Page</button>
          <button class="make-stripe" data-index="${index}">Make Stripe Link</button>
          <button class="delete-btn" data-index="${index}">Delete Item</button>
        </div>
      </div>
    `;
    shopList.appendChild(card);
  });

  attachListeners();
  initUploadBoxes();      // unified uploader for image + file
  initGeneratorButtons(); // product/download
  initStripeButtons();    // stripe link
}

// ===== GENERALIZED UPLOAD WIRING =====
function initUploadBoxes() {
  wireUploadBox(".image-upload");
  wireUploadBox(".file-upload");
}

function wireUploadBox(selector) {
  document.querySelectorAll(selector).forEach((box) => {
    const index = box.dataset.index;
    const key = box.dataset.key; // "image" or "downloadFile"
    const input = box.querySelector('input[type="file"]');

    box.addEventListener("click", () => input.click());
    box.addEventListener("dragover", (e) => e.preventDefault());
    box.addEventListener("drop", (e) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) uploadFile(file, index, key, box);
    });
    input.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) uploadFile(file, index, key, box);
    });
  });
}

async function uploadFile(file, index, key, box) {
  const formData = new FormData();
  formData.append("file", file);
  try {
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (!data.url) throw new Error("No URL returned");
    products[index][key] = data.url;

    // Update UI
    if (key === "image") {
      box.innerHTML = `<img src="${data.url}" class="preview">`;
    } else {
      const basename = data.url.split("/").pop();
      box.innerHTML = `<p class="file-chip">${basename}</p>`;
    }
  } catch (err) {
    console.error("Upload failed:", err);
    alert("❌ Image/file upload failed. Check console for details.");
  }
}

// ===== INPUT / DELETE / ADD LISTENERS =====
function attachListeners() {
  document.querySelectorAll("input, textarea").forEach((el) => {
    el.addEventListener("input", handleInput);
  });
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", handleDelete);
  });
}

function handleInput(e) {
  const { index, key } = e.target.dataset;
  const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;

  if (key === "tags") {
    products[index][key] = value
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  } else if (key === "price") {
    products[index][key] = parseFloat(value) || 0;
  } else if (key) {
    products[index][key] = value;
  }
}

function addProduct() {
  products.push({
    id: `prod-${Date.now()}`,
    title: "",
    price: 0,
    image: "",
    downloadFile: "",
    description: "",
    category: "",
    tags: [],
    stripeUrl: "",
    pageUrl: "",
    downloadUrl: "",
    isAdult: false,
    isSold: false
  });
  renderShop();
  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
}

function handleDelete(e) {
  const index = e.target.dataset.index;
  if (!confirm("Delete this product?")) return;
  products.splice(index, 1);
  renderShop();
}

async function saveShop() {
  try {
    const res = await fetch("/api/content/shop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(products, null, 2)
    });
    if (!res.ok) throw new Error("Save failed");
    console.log("✅ Shop data saved successfully!");
  } catch (err) {
    console.error("Save error:", err);
    alert("❌ Error saving shop data. Check console for details.");
  }
}

// ===== GENERATE PAGE BUTTONS =====
function initGeneratorButtons() {
  document.querySelectorAll(".gen-product").forEach((btn) =>
    btn.addEventListener("click", handleGenerateProduct)
  );
  document.querySelectorAll(".gen-download").forEach((btn) =>
    btn.addEventListener("click", handleGenerateDownload)
  );
}

async function handleGenerateProduct(e) {
  const index = e.target.dataset.index;
  const item = products[index];
  try {
    const res = await fetch("/api/generate/product", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Gen product failed");
    item.pageUrl = data.pageUrl;
    alert(`✅ Product page created: ${data.pageUrl}`);
    await saveShop();
  } catch (err) {
    console.error(err);
    alert("❌ Failed to generate product page.");
  }
}

async function handleGenerateDownload(e) {
  const index = e.target.dataset.index;
  const item = products[index];
  try {
    const res = await fetch("/api/generate/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Gen download failed");
    item.downloadUrl = data.downloadUrl;
    alert(`✅ Download page created: ${data.downloadUrl}`);
    await saveShop();
  } catch (err) {
    console.error(err);
    alert("❌ Failed to generate download page.");
  }
}

// ===== STRIPE LINK BUTTON =====
function initStripeButtons() {
  document.querySelectorAll(".make-stripe").forEach((btn) =>
    btn.addEventListener("click", handleMakeStripeLink)
  );
}

async function handleMakeStripeLink(e) {
  const index = e.target.dataset.index;
  const item = products[index];

  if (!item.title || !item.price) {
    return alert("Title and price are required before making a Stripe link.");
  }

  // Ensure a download page exists to redirect to; if not, try to generate one if we have a file.
  if (!item.downloadUrl) {
    if (!item.downloadFile) {
      return alert("Upload the Digital File and click 'Generate Download Page' first.");
    }
    try {
      const res = await fetch("/api/generate/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Download page gen failed");
      item.downloadUrl = data.downloadUrl;
    } catch (err) {
      console.error(err);
      return alert("❌ Could not generate download page.");
    }
  }

  try {
    const res = await fetch("/api/stripe/create-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: item.title,
        price: item.price,
        redirectUrl: item.downloadUrl
      })
    });
    const data = await res.json();
    if (!res.ok || !data.url) throw new Error(data.error || "Stripe error");
    item.stripeUrl = data.url;
    await saveShop();
    alert("✅ Stripe link created and saved to this item.");
  } catch (err) {
    console.error(err);
    alert("❌ Could not create Stripe link. Check console.");
  }
}

// ===== EVENT HOOKUP =====
saveBtn?.addEventListener("click", saveShop);
addBtn?.addEventListener("click", addProduct);
addBtnMobile?.addEventListener("click", addProduct);

// ===== INIT =====
loadShop();
