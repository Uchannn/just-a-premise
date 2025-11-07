let currentFile = null;
let data = [];

async function loadFile(type) {
  if (type !== "shop") return;
  currentFile = "data/shop.json";
  document.getElementById("file-title").textContent = "Shop";
  document.getElementById("file-desc").textContent = "Edit products below";

const res = await fetch("/data/shop.json?cachebust=" + Date.now());
  data = await res.json();
  renderCards();
}

function renderCards() {
  const grid = document.getElementById("card-grid");
  grid.innerHTML = "";

  data.forEach((item, index) => {
    const card = document.createElement("div");
card.className = "card";
card.innerHTML = `
  <div class="card-body open">
    <input value="${item.title}" data-field="title" placeholder="Title">
    <input type="number" value="${item.price}" data-field="price" placeholder="Price">
    <input value="${item.stripe_link || ""}" data-field="stripe_link" placeholder="Stripe link">
    <textarea data-field="description" placeholder="Description">${item.description || ""}</textarea>
    <label><input type="checkbox" ${item.available ? "checked" : ""} data-field="available"> Available</label>
    <button class="delete-btn" onclick="removeItem(${index})">Delete</button>
  </div>
`;

    grid.appendChild(card);
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

async function saveJSON() {
  const token = localStorage.getItem("cms_token");
  if (!token) {
    alert("No GitHub token found. In your browser console, run:\nlocalStorage.setItem('cms_token','YOUR_TOKEN')");
    return;
  }

  const repo = "Uchannn/just-a-premise";
  const path = "data/shop.json";
  const message = "Auto-update shop.json from CMS";

  // Rebuild product data from your form
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

  // Get the file’s current SHA (required by GitHub)
  const getRes = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
    headers: { Authorization: `token ${token}` }
  });
  const fileData = await getRes.json();

  // Push the new file contents
  const updateRes = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
    method: "PUT",
    headers: {
      Authorization: `token ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message,
      content: btoa(unescape(encodeURIComponent(jsonString))),
      sha: fileData.sha
    })
  });

  if (updateRes.ok) {
    alert("✅ shop.json pushed live to GitHub!");
  } else {
    const err = await updateRes.json();
    console.error(err);
    alert("❌ Failed to push. See console for details.");
  }
}

