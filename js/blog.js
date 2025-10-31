// BLOG FEED SCRIPT
const blogGrid = document.getElementById("blogGrid");
const substackFeed = "https://justapremise.substack.com/feed";
const feedURL =
  "https://api.allorigins.win/get?url=" +
  encodeURIComponent(
    "https://api.rss2json.com/v1/api.json?rss_url=" + substackFeed
  );

async function loadBlogPosts() {
  try {
    const response = await fetch(feedURL);
    const wrapper = await response.json();
    const data = JSON.parse(wrapper.contents);
    const posts = data.items.slice(0, 6); // latest 6

    blogGrid.innerHTML = "";

    posts.forEach((post) => {
      const card = document.createElement("div");
      card.className = "product-card";

      const date = new Date(post.pubDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      card.innerHTML = `
        <img src="${post.thumbnail || "images/JP-icon.png"}" alt="${post.title}">
        <h3>${post.title}</h3>
        <p style="font-size:0.9rem; color:#777;">${date}</p>
        <p>${post.description ? post.description.substring(0, 160) + "…" : ""}</p>
        <a href="${post.link}" target="_blank" class="shop-button">Read on Substack</a>
      `;

      blogGrid.appendChild(card);
    });
  } catch (err) {
    blogGrid.innerHTML =
      "<p>Could not load posts right now. Try again later.</p>";
    console.error("Blog feed error:", err);
  }
}

loadBlogPosts();

