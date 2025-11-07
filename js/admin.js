let currentFile = null;
let data = [];

async function loadFile(type) {
  if (type !== "shop") return;
  currentFile = "data/shop.json";
  document.getElementById("file-title").textContent = "Shop";
  document.getElementById("file-desc").textContent = "Edit products below";

  const res = await fetch("../data/shop.json?cachebust=" + Date.now());
  data = await res.json();
  renderCards();
}

function renderCards() {
  const grid = document.getElementById("card-grid");
  grid.innerHTML = "";
  data.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "cms-card";
    card.innerHTML = `
      <input value="${item.title}" data-field="title" placeholder="Title">
      <input type="number" value="${item.price}" data-field="price" placeholder="Price">
      <input value="${item.stripe_link || ""}" data-field="stripe_link" placeholder="Stripe link">
      <textarea data-field="description" placeholder="Description">${item.description || ""}</textarea>
      <label><input type="checkbox" ${item.available ? "checked" : ""} data-field="available"> Available</label>
      <button onclick="removeItem(${index})">Delete</button>
    `;
    grid.append(card);
  });
}

function addItem() {
  data.push({
    id: Date.now().toString(),
    title: "New Product",
    price: 0,
    available: true,
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

function saveJSON() {
  const cards = document.querySelectorAll(".cms-card");
  data = Array.from(cards).map(card => {
    const obj = {};
    card.querySelectorAll("[data-field]").forEach(el => {
      const field = el.dataset.field;
      if (el.type === "checkbox") obj[field] = el.checked;
      else obj[field] = el.value;
    });
    return obj;
  });

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "shop.json";
  a.click();
}
