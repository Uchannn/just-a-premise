// shop.js — renders products from shop.json

async function loadShop() {
  try {
    const res = await fetch('content/shop.json');
    if (!res.ok) throw new Error('Shop data not found.');
    const products = await res.json();

    const shopContainer = document.getElementById('shop');
    shopContainer.innerHTML = '';

    // Build product cards
    products.forEach((product) => {
      const card = document.createElement('div');
      card.classList.add('product-card');

      // Link to product page (wraps image + title)
      const link = document.createElement('a');
      link.href = `product.html?id=${product.id}`;
      link.classList.add('product-link');

      if (product.images && product.images.length > 0) {
        const img = document.createElement('img');
        img.src = product.images[0];
        img.alt = product.title;
        link.appendChild(img);
      }

      const title = document.createElement('h3');
      title.textContent = product.title;
      link.appendChild(title);

      card.appendChild(link);

      // Description
      const desc = document.createElement('p');
      desc.textContent = product.description || '';
      card.appendChild(desc);

      // Price
      const price = document.createElement('p');
      price.classList.add('price');
      price.textContent = `$${product.price}`;
      card.appendChild(price);

      // Buy/Sold button
      const button = document.createElement('button');
      if (!product.available) {
        button.textContent = 'SOLD OUT';
        button.disabled = true;
        button.classList.add('sold');
      } else {
        button.textContent = 'Buy Now';
        button.onclick = () => openStripeCheckout(product.stripe_link);
      }
      card.appendChild(button);

      // Add to shop container
      shopContainer.appendChild(card);
    });

  } catch (err) {
    console.error('Error loading shop:', err);
    const shopContainer = document.getElementById('shop');
    shopContainer.innerHTML = `<p>Error loading shop data.</p>`;
  }
}

// Placeholder for Stripe integration
function openStripeCheckout(link) {
  if (!link) {
    alert('No Stripe link configured.');
    return;
  }
  window.location.href = link;
}

// Run it when the page loads
document.addEventListener('DOMContentLoaded', loadShop);
