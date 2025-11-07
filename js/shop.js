async function loadShop() {
  const grid = document.getElementById("shop-grid");
  grid.innerHTML = "<p>Loading products...</p>";

  try {
    const response = await fetch("data/shop.json?cachebust=" + Date.now());
    const products = await response.json();
    grid.innerHTML = "";

    products.forEach(p => {
      const card = document.createElement("div");
      card.className = "product-card" + (!p.available ? " sold" : "");

      const img = document.createElement("img");
      img.src = p.images?.[0] || "images/placeholder.jpg";
      img.alt = p.title;

      const title = document.createElement("h3");
      title.textContent = p.title;

      const desc = document.createElement("p");
      desc.textContent = p.description || "";

      const price = document.createElement("p");
      price.className = "price";
      price.textContent = `$${p.price}`;

      card.append(img, title, desc, price);

      if (p.available && p.stripe_link) {
        const btn = document.createElement("a");
        btn.href = p.stripe_link;
        btn.target = "_blank";
        btn.textContent = "Buy Now";
        btn.className = "buy-btn";
        card.append(btn);
      } else if (!p.available) {
        const sold = document.createElement("span");
        sold.className = "sold-badge";
        sold.textContent = "SOLD";
        card.append(sold);
      }

      grid.append(card);
    });

    if (!products.length) grid.innerHTML = "<p>No products yet.</p>";

  } catch (err) {
    console.error(err);
    grid.innerHTML = "<p>Failed to load products.</p>";
  }
}

document.addEventListener("DOMContentLoaded", loadShop);
