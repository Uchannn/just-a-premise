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
        <input type="number" step="0.01" data-index="${index}" data-key="price" value="${item.price || ""}">

        <label>Image</label>
        <div class="image-upload" data-index="${index}">
          ${
            item.image
              ? `<img src="${item.image}" alt="" class="preview">`
              : `<p class="drop-zone">Drag & drop or click to upload</p>`
          }
          <input type="file" accept="image/*" hidden>
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

        <button class="gen-product" data-index="${index}">Generate Product Page</button>
        <button class="gen-download" data-index="${index}">Generate Download Page</button>

        <button class="delete-btn" data-index="${index}">Delete Item</button>
      </div>
    `;
    shopList.appendChild(card);
  });

  attachListeners();
  initImageUploads();
  initGeneratorButtons(); // fix for the missing listeners
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

// ===== HANDLE FIELD EDITS =====
function handleInput(e) {
  const { index, key } = e.target.dataset;
  const value =
    e.target.type === "checkbox"
      ? e.target.checked
      : e.target.value;

  if (key === "tags") {
    products[index][key] = value
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t);
  } else if (key === "price") {
    products[index][key] = parseFloat(value) || 0;
  } else {
    products[index][key] = value;
  }
}

// ===== ADD NEW PRODUCT =====
function addProduct() {
  products.push({
    id: `prod-${Date.now()}`,
    title: "",
    price: 0,
    image: "",
    description: "",
    category: "",
    tags: [],
    stripeUrl: "",
    isAdult: false,
    isSold: false
  });
  renderShop();
  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
}

// ===== DELETE PRODUCT =====
function handleDelete(e) {
  const index = e.target.dataset.index;
  if (!confirm("Delete this product?")) return;
  products.splice(index, 1);
  renderShop();
}

// ===== SAVE ALL CHANGES =====
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
  document.querySelectorAll(".gen-product").forEach((btn) => {
    btn.addEventListener("click", handleGenerateProduct);
  });
  document.querySelectorAll(".gen-download").forEach((btn) => {
    btn.addEventListener("click", handleGenerateDownload);
  });
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
    if (data.success) {
      item.pageUrl = data.pageUrl;
      alert(`✅ Product page created: ${data.pageUrl}`);
      await saveShop();
    } else {
      throw new Error(data.error);
    }
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
    if (data.success) {
      item.downloadUrl = data.downloadUrl;
      alert(`✅ Download page created: ${data.downloadUrl}`);
      await saveShop();
    } else {
      throw new Error(data.error);
    }
  } catch (err) {
    console.error(err);
    alert("❌ Failed to generate download page.");
  }
}

// ===== IMAGE UPLOAD HANDLER =====
function initImageUploads() {
  document.querySelectorAll(".image-upload").forEach((box) => {
    const index = box.dataset.index;
    const input = box.querySelector("input[type=file]");

    box.addEventListener("click", () => input.click());
    box.addEventListener("dragover", (e) => e.preventDefault());
    box.addEventListener("drop", (e) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) uploadFile(file, index, box);
    });
    input.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) uploadFile(file, index, box);
    });
  });
}

async function uploadFile(file, index, box) {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();

    if (data.url) {
      products[index].image = data.url;
      box.innerHTML = `<img src="${data.url}" class="preview">`;
    } else {
      throw new Error("No URL returned");
    }
  } catch (err) {
    console.error("Upload failed:", err);
    alert("❌ Image upload failed. Check console for details.");
  }
}

// ===== EVENT HOOKUP =====
saveBtn?.addEventListener("click", saveShop);
addBtn?.addEventListener("click", addProduct);
addBtnMobile?.addEventListener("click", addProduct);

// ===== INIT =====
loadShop();
