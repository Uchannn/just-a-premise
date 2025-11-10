// cms/admin.js
const API = "http://localhost:4000/api";
let currentType = "shop";
let data = [];

/* ===========================================================
   KEEP LOGIN AFTER REFRESH
   =========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("cms_token");
  if (token === "admin-session") {
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("cms-screen").style.display = "block";
    loadData(); // load dashboard data immediately
  } else {
    document.getElementById("login-screen").style.display = "block";
    document.getElementById("cms-screen").style.display = "none";
  }
});

/* ===========================================================
   LOGIN + LOGOUT
   =========================================================== */
async function login() {
  const user = document.getElementById("user").value;
  const pass = document.getElementById("pass").value;

  const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: user, password: pass }),
  });
  const out = await res.json();

  if (out.success) {
    // Save token locally so session persists
    localStorage.setItem("cms_token", out.token);
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("cms-screen").style.display = "block";
    loadData();
  } else {
    document.getElementById("login-status").innerText = "❌ Invalid credentials";
  }
}

function logout() {
  localStorage.removeItem("cms_token");
  document.getElementById("cms-screen").style.display = "none";
  document.getElementById("login-screen").style.display = "block";
}

/* ===========================================================
   DATA HANDLING
   =========================================================== */
async function loadData() {
  currentType = document.getElementById("data-type").value;
  try {
    const res = await fetch(`${API}/content/${currentType}`);
    data = await res.json();
    renderItems();
  } catch (err) {
    alert("Error loading data");
  }
}

function renderItems() {
  const grid = document.getElementById("item-grid");
  grid.innerHTML = "";

  data.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "cms-card";
    card.innerHTML = `
      <h3>${item.title || "Untitled Product"}</h3>

      <label>Title</label>
      <input value="${item.title || ""}" onchange="updateField(${index}, 'title', this.value)">

      <label>Price ($)</label>
      <input type="number" step="0.01" value="${item.price || 0}" onchange="updateField(${index}, 'price', parseFloat(this.value))">

      <label>Description</label>
      <textarea onchange="updateField(${index}, 'description', this.value)">${item.description || ""}</textarea>

      <label>Available</label>
      <input type="checkbox" ${item.available ? "checked" : ""} onchange="updateField(${index}, 'available', this.checked)">

      <label>18+ Content</label>
      <input type="checkbox" ${item.adult ? "checked" : ""} onchange="updateField(${index}, 'adult', this.checked)">

      <label>Stripe Link</label>
      <input value="${item.stripe_link || ""}" onchange="updateField(${index}, 'stripe_link', this.value)">

      <button onclick="generateStripe(${index})">💳 Generate Stripe Link</button>
      <button onclick="deleteItem(${index})" style="background:#ffd6e0;">🗑 Delete</button>
    `;
    grid.appendChild(card);
  });
}

/* ===========================================================
   CRUD HELPERS
   =========================================================== */
function updateField(index, field, value) {
  data[index][field] = value;
}

function addItem() {
  data.push({
    title: "New Product",
    price: 0,
    description: "",
    available: true,
    adult: false,
    stripe_link: "",
  });
  renderItems();
}

function deleteItem(index) {
  if (confirm("Delete this item?")) {
    data.splice(index, 1);
    renderItems();
  }
}

async function saveData() {
  try {
    const res = await fetch(`${API}/content/${currentType}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const out = await res.json();
    if (out.success) alert("✅ Saved successfully!");
    else alert("❌ Save failed");
  } catch (err) {
    alert("⚠️ Error saving data");
  }
}

/* ===========================================================
   STRIPE LINK GENERATOR
   =========================================================== */
async function generateStripe(index) {
  const item = data[index];
  if (!item.title || !item.price) {
    return alert("⚠️ You must set a title and price first!");
  }

  const res = await fetch(`${API}/stripe/create-link`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: item.title, price: item.price }),
  });

  const out = await res.json();
  if (out.success) {
    data[index].stripe_link = out.url;
    alert("✅ Stripe link created!");
    renderItems();
  } else {
    alert("❌ Stripe error: " + out.error);
  }
}
