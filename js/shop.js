// ---------- PRODUCT DATA ----------
const products = [
{
  id: 1,
  title: "Boyfriend Haunting",
  tag: "blueprint", // moved from "kit" to "blueprint"
  type: "exclusive",
  status: "available",
  price: 1000, // updated from 200
  description: "A romantic horror blueprint that blurs the line between memory and obsession.",
  image: "images/BH JAP image listing.png",
  link: "product-boyfriend-haunting.html",
  kofi: "https://ko-fi.com/s/0dbc2a64d8",
  isNew: true
},
];

// ---------- SELECTORS ----------
const grid = document.getElementById("productGrid");
const statusFilter = document.getElementById("statusFilter");
const sortFilter = document.getElementById("sortFilter");
const tagFilters = document.querySelectorAll(".tag-filters input");

// ---------- DISPLAY FUNCTION ----------
function displayProducts() {
  grid.innerHTML = "";

  const selectedStatus = statusFilter.value;
  const selectedTags = Array.from(tagFilters)
    .filter(t => t.checked)
    .map(t => t.value);
  const selectedSort = sortFilter.value;

  // ----- Base Filter -----
  let filtered = products.filter(p => {
    const matchStatus =
      selectedStatus === "all" || p.status === selectedStatus;
    const matchTag =
      selectedTags.length === 0 || selectedTags.includes(p.tag);
    return matchStatus && matchTag;
  });

  // ----- Sorting -----
  if (selectedSort === "newest") {
    // newest = higher id first
    filtered.sort((a, b) => b.id - a.id);
  } else if (selectedSort === "oldest") {
    filtered.sort((a, b) => a.id - b.id);
  } else if (selectedSort === "lowprice") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (selectedSort === "highprice") {
    filtered.sort((a, b) => b.price - a.price);
  }

  // ----- Create Cards -----
  if (filtered.length === 0) {
    grid.innerHTML = `<p>No products match your filters.</p>`;
    return;
  }

  filtered.forEach(p => {
    const card = document.createElement("div");
    card.className = `product-card ${p.status}`;
    card.innerHTML = `
      <div class="product-image">
        <img src="${p.image}" alt="${p.title}">
        ${
          p.status === "comingsoon"
            ? '<div class="status-badge comingsoon">Coming Soon</div>'
            : ""
        }
      </div>
      <h3>${p.title}</h3>
      <p>${p.description}</p>
      <p class="price">${p.price >= 1000 ? "$1,000+" : `$${p.price}`}</p>
      <a href="${p.link}" class="shop-button">View Product</a>
    `;
    grid.appendChild(card);
  });
}


// ---------- EVENT LISTENERS ----------
statusFilter.addEventListener("change", displayProducts);
sortFilter.addEventListener("change", displayProducts);
tagFilters.forEach(tag => tag.addEventListener("change", displayProducts));

// Initial render
displayProducts();

