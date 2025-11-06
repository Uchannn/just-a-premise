let currentFile = "";
let data = [];

async function loadFile(name) {
  currentFile = name;
  document.getElementById("file-title").textContent = "Editing: " + name;
  document.getElementById("file-desc").textContent =
    "Below are all entries for " + name + ". Click a card to expand and edit.";

  try {
    const res = await fetch(`content/${name}.json`);
    data = await res.json();
    renderCards();
  } catch (err) {
    alert("Could not load " + name + ".json");
    console.error(err);
  }
}

function renderCards() {
  const grid = document.getElementById("card-grid");
  grid.innerHTML = "";
  data.forEach((item, i) => {
    const card = document.createElement("div");
    card.className = "card";
    if (item.adult) card.classList.add("adult");
    if (!item.available) card.classList.add("sold");

    card.innerHTML = `
  <div class="card-header" onclick="toggleExpand(${i})">
    <h3>${item.title || "Untitled"}</h3>
    <div class="badges">
      ${!item.available ? `<span class="badge sold">SOLD</span>` : ""}
      ${item.adult ? `<span class="badge adult">18+</span>` : ""}
    </div>
  </div>

  <div class="card-body" id="body-${i}">
    <label>Title</label>
    <input type="text" value="${item.title || ""}"
      oninput="updateField(${i}, 'title', this.value)" />

    <label>Description</label>
    <textarea oninput="updateField(${i}, 'description', this.value)">${item.description || ""}</textarea>

    <label>Price</label>
    <input type="number" step="0.01" value="${item.price || ""}"
      oninput="updateField(${i}, 'price', parseFloat(this.value))" />

    <label><input type="checkbox" ${item.available ? "checked" : ""} 
      onchange="updateField(${i}, 'available', this.checked)" /> Available</label>

    <label><input type="checkbox" ${item.featured ? "checked" : ""} 
      onchange="updateField(${i}, 'featured', this.checked)" /> Featured</label>

    <label><input type="checkbox" ${item.adult ? "checked" : ""} 
      onchange="updateField(${i}, 'adult', this.checked)" /> 18+ Content</label>

    <button class="delete-btn" onclick="deleteItem(${i})">🗑 Delete Item</button>
  </div>
`;

    grid.appendChild(card);
  });
}

function toggleExpand(i) {
  document.getElementById(`body-${i}`).classList.toggle("open");
}

function updateField(index, key, value) {
  data[index][key] = value;
}

function addItem() {
  data.push({
    title: "New Item",
    description: "",
    price: 0,
    available: true,
    featured: false,
    adult: false,
  });
  renderCards();
}

function saveJSON() {
  if (!currentFile) return alert("No file loaded!");
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${currentFile}.json`;
  a.click();
}

function importLocalFile() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json";
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      data = JSON.parse(reader.result);
      renderCards();
    };
    reader.readAsText(file);
  };
  input.click();
}

// 💀 deleteItem belongs OUTSIDE importLocalFile()
function deleteItem(index) {
  const confirmDelete = confirm("Delete this item? This action cannot be undone.");
  if (confirmDelete) {
    data.splice(index, 1);
    renderCards();
  }
}

