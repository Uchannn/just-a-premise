let currentFile = null;
let data = [];

/* ─────────────── Load Shop Data ─────────────── */
async function loadFile(type) {
  if (type !== "shop") return;
  currentFile = "data/shop.json";
  document.getElementById("file-title").textContent = "Shop";
  document.getElementById("file-desc").textContent = "Edit products below";

  const res = await fetch("/data/shop.json?cachebust=" + Date.now());
  data = await res.json();
  renderCards();
}

/* ─────────────── Filtering Logic ─────────────── */
function getFilteredData() {
  let filtered = [...data];

  const search = document.getElementById("filter-search")?.value.toLowerCase() || "";
  const avail = document.getElementById("filter-availability")?.value || "all";
  const adult = document.getElementById("filter-adult")?.value || "all";
  const min = parseFloat(document.getElementById("filter-min")?.value) || 0;
  const max = parseFloat(document.getElementById("filter-max")?.value) || Infinity;

  // Search
  if (search) filtered = filtered.filter(p => p.title.toLowerCase().includes(search));

  // Availability
  if (avail === "available") filtered = filtered.filter(p => p.available);
  if (avail === "sold") filtered = filtered.filter(p => !p.available);

  // Adult content
  if (adult === "adult") filtered = filtered.filter(p => p.adult);
  if (adult === "nonadult") filtered = filtered.filter(p => !p.adult);

  // Price range
  filtered = filtered.filter(p => p.price >= min && p.price <= max);

  return filtered;
}

/* ─────────────── Render Editable Cards ─────────────── */
function renderCards() {
  const grid = document.getElementById("card-grid");
  grid.innerHTML = "";

  const filteredData = getFilteredData();

  filteredData.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="card-body open">
        <input value="${item.title}" data-field="title" placeholder="Title">
        <input type="number" value="${item.price}" data-field="price" placeholder="Price">
        <input value="${item.stripe_link || ""}" data-field="stripe_link" placeholder="Stripe link">
        <textarea data-field="description" placeholder="Description">${item.description || ""}</textarea>

        <label><input type="checkbox" ${item.available ? "checked" : ""} data-field="available"> Available</label>
        <label><input type="checkbox" ${item.adult ? "checked" : ""} data-field="adult"> 18+ Content</label>

        <button class="delete-btn" onclick="removeItem(${index})">Delete</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

/* ─────────────── Add / Remove Products ─────────────── */
function addItem() {
  data.push({
    id: crypto.randomUUID(),
    title: "New Product",
    price: 0,
    available: true,
    adult: false,
    stripe_link: "",
    description: "",
    images: []
  });
  renderCards();
}

function removeItem(i) {
  data.splice(i, 1);
  renderCards();
}

/* ─────────────── Save + Push to GitHub ─────────────── */
async function saveJSON() {
  const token = localStorage.getItem("cms_token");
  if (!token) {
    alert("⚠️ No GitHub token found.\nRun this in browser console:\nlocalStorage.setItem('cms_token','YOUR_TOKEN')");
    return;
  }

  const repo = "Uchannn/just-a-premise";
  const path = "data/shop.json";
  const message = "Update shop.json via CMS";

  const cards = document.querySelectorAll(".card-body");
  const updated = Array.from(cards).map(card => {
    const obj = {};
    card.querySelectorAll("[data-field]").forEach(el => {
      const field = el.dataset.field;
      obj[field] = el.type === "checkbox" ? el.checked : el.value;
    });
    return obj;
  });

  const jsonString = JSON.stringify(updated, null, 2);

  const getRes = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
    headers: { Authorization: `token ${token}` }
  });
  if (!getRes.ok) {
    alert("Token invalid or missing repo permissions. Logging out...");
    logout();
    return;
  }
  const fileData = await getRes.json();

  const updateRes = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
    method: "PUT",
    headers: {
      Authorization: `token ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message,
      content: btoa(unescape(encodeURIComponent(jsonString))),
      sha: fileData.sha,
      branch: "main"
    })
  });

  if (updateRes.ok) {
    alert("✅ shop.json saved and pushed live!");
    loadFile("shop");
  } else {
    const err = await updateRes.json();
    console.error(err);
    alert("❌ Failed to push. See console for details.");
  }
}

/* ─────────────── Logout ─────────────── */
function logout() {
  localStorage.removeItem("cms_token");
  location.reload();
}

/* ─────────────── Filter Event Listeners ─────────────── */
["filter-search", "filter-availability", "filter-adult", "filter-min", "filter-max"]
  .forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", renderCards);
  });
