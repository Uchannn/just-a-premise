const API = "http://localhost:4000/api";
let currentType = "shop";

async function login() {
  const user = document.getElementById("user").value;
  const pass = document.getElementById("pass").value;

  const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: user, password: pass }),
  });
  const data = await res.json();
  if (data.success) {
    localStorage.setItem("cms_token", data.token);
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("cms-screen").style.display = "block";
    loadData();
  } else {
    document.getElementById("login-status").innerText = "Invalid login";
  }
}

function logout() {
  localStorage.removeItem("cms_token");
  document.getElementById("login-screen").style.display = "block";
  document.getElementById("cms-screen").style.display = "none";
}

async function loadData() {
  currentType = document.getElementById("data-type").value;
  const res = await fetch(`${API}/content/${currentType}`);
  const json = await res.json();
  document.getElementById("editor").value = JSON.stringify(json, null, 2);
}

async function saveData() {
  const json = JSON.parse(document.getElementById("editor").value);
  const res = await fetch(`${API}/content/${currentType}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(json),
  });
  const result = await res.json();
  alert(result.success ? "Saved!" : "Error saving data");
}
