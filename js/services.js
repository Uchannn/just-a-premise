const services = [
  {
    id: 1,
    title: "Premise (1k+ words)",
    category: "premise",
    price: 550,
    description: "A short story concept with hook, outline, and full prose intro — exclusive rights included.",
    image: "images/ser-premise-cover-web.png",
    link: "service-premise.html"
  }
];

const grid = document.getElementById("serviceGrid");
const filter = document.getElementById("serviceType");

function displayServices() {
  const selected = filter.value;
  grid.innerHTML = "";

  const filtered = services.filter(s => selected === "all" || s.category === selected);

  filtered.forEach(s => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${s.image}" alt="${s.title}">
      <h3>${s.title}</h3>
      <p>${s.description}</p>
      <p class="price">$${s.price}</p>
      <a href="${s.link}" class="shop-button">View Service</a>
    `;
    grid.appendChild(card);
  });
}

filter.addEventListener("change", displayServices);
displayServices();
