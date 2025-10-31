// ========== CART SYSTEM ==========
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Update cart count on page load
function updateCartCount() {
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  const cartCount = document.getElementById("cart-count");
  if (cartCount) cartCount.textContent = count;
}

// Add item to cart
function addToCart(product) {
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  alert(`${product.name} added to your cart!`);
}

// Remove item from cart
function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartDisplay();
  updateCartCount();
}

// Display cart on cart.html
function updateCartDisplay() {
  const cartContainer = document.getElementById("cart-items");
  const totalDisplay = document.getElementById("cart-total");

  if (!cartContainer) return;
  cartContainer.innerHTML = "";

  let total = 0;
  cart.forEach(item => {
    total += item.price * item.quantity;
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
      <p><strong>${item.name}</strong> - $${item.price} × ${item.quantity}</p>
      <button onclick="removeFromCart('${item.id}')">Remove</button>
    `;
    cartContainer.appendChild(div);
  });

  totalDisplay.textContent = `Total: $${total.toFixed(2)}`;
}

// Run updates
updateCartCount();
