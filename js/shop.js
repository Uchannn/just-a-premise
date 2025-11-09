// ─────────────── Load Products ───────────────
fetch("/data/shop.json")
  .then(res => res.json())
  .then(data => {
    const grid = document.getElementById("shop-grid");
    grid.innerHTML = "";

    data.forEach((item) => {
      const card = document.createElement("div");
      card.className = "product-card";

      // Build product card
      card.innerHTML = `
        <img src="${item.image || 'images/placeholder.jpg'}" alt="${item.title}">
        <h3>${item.title}</h3>
        <p class="price">$${item.price}</p>
        ${item.adult ? `<div class="sold-badge" style="background:#ffb6c7;">18+ Content</div>` : ""}
        <button class="buy-btn" ${!item.available ? "disabled" : ""}>
          ${item.available ? "View Product" : "Sold Out"}
        </button>
      `;

      // Handle button click
      const button = card.querySelector(".buy-btn");
      button.addEventListener("click", () => {
        if (!item.available) return;

        // Check if product is 18+
        if (item.adult) {
          // Check if user has already verified age
          if (!localStorage.getItem("age_verified")) {
            showAgeGate(item);
          } else {
            window.location.href = `/product.html?id=${item.id}`;
          }
        } else {
          // Normal item, go straight to product page
          window.location.href = `/product.html?id=${item.id}`;
        }
      });

      grid.appendChild(card);
    });
  })
  .catch(err => console.error("Error loading shop:", err));


// ─────────────── AGE GATE ───────────────
function showAgeGate(item) {
  const modal = document.createElement("div");
  modal.className = "age-modal";
  modal.innerHTML = `
    <div class="age-modal-content">
      <h2>Adult Content Warning</h2>
      <p>This product contains mature material. You must be 18 or older to view or purchase it.</p>
      <div class="age-buttons">
        <button id="age-yes">Yes, I’m 18+</button>
        <button id="age-no">No, I’m not</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // Handle choices
  document.getElementById("age-yes").addEventListener("click", () => {
    localStorage.setItem("age_verified", "true"); // Remember approval
    document.body.removeChild(modal);
    window.location.href = `/product.html?id=${item.id}`;
  });

  document.getElementById("age-no").addEventListener("click", () => {
    document.body.removeChild(modal);
  });
}
