const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

if (!productId) {
  document.getElementById("product-detail").innerHTML =
    "<p>Product not found.</p>";
} else {
  fetch("/content/shop.json")
    .then(res => res.json())
    .then(data => {
      const item = data.find(p => p.id === productId);
      if (!item) {
        document.getElementById("product-detail").innerHTML =
          "<p>Product not found.</p>";
        return;
      }

      document.title = `${item.title} — Just a Premise`;
      document.getElementById("product-detail").innerHTML = `
        <div class="product-hero">
          <img src="${item.image}" alt="${item.title}">
          <div class="product-info">
            <h1>${item.title}</h1>
            <p class="product-price">$${item.price}</p>
            <p>${item.description}</p>
            <p class="product-tags">${item.tags
              .map(tag => `<span>${tag}</span>`)
              .join("")}</p>
            <button class="buy-btn" ${
              !item.available ? "disabled" : ""
            }>${item.available ? "Add to Cart" : "Sold Out"}</button>
          </div>
        </div>
      `;
    })
    .catch(err => console.error("Error loading product:", err));
}
