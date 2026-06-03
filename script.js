const BASE_URL = "http://localhost:8080";

// ================= LOGIN =================
function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  fetch(`${BASE_URL}/api/v3/auth/login?username=${email}&password=${password}`, {
    method: "POST"
  })
  .then(res => res.json())
  .then(data => {
    console.log("Login:", data);

    if (!data.payload || data.payload.includes("Invalid")) {
      alert("Login Failed: " + data.payload);
      return;
    }

    localStorage.setItem("token", data.payload.trim());

    alert("Login Success");
    window.location.href = "products.html";
  })
  .catch(() => alert("Login error"));
}

// ================= SEND OTP =================
function sendOtp() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  localStorage.setItem("tempUser", JSON.stringify({ name, email, password }));

  fetch(`${BASE_URL}/api/v2/user/registration`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password })
  })
  .then(res => res.json())
  .then(() => {
    alert("OTP Sent");
    window.location.href = "otp.html";
  })
  .catch(() => alert("Failed to send OTP"));
}

// ================= VERIFY OTP =================
function verifyOtp() {
  const otp = document.getElementById("otp").value;
  const tempUser = JSON.parse(localStorage.getItem("tempUser"));

  fetch(`${BASE_URL}/api/v2/user/verification`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: tempUser.email,
      otp: otp
    })
  })
  .then(res => res.json())
  .then(() => {
    alert("Registration Successful");
    localStorage.removeItem("tempUser");
    window.location.href = "login.html";
  })
  .catch(() => alert("Invalid OTP"));
}

// ================= ADD PRODUCT =================
function addProduct() {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please login first");
    return;
  }

  fetch(`${BASE_URL}/api/v1.0/product`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({
      name: document.getElementById("pname").value,
      price: document.getElementById("pprice").value,
      brand: document.getElementById("pbrand").value,
      catagory: document.getElementById("pcategory").value,
      description: document.getElementById("pdesc").value
    })
  })
  .then(res => {
    if (!res.ok) throw new Error();
    return res.json();
  })
  .then(() => {
    alert("Product Added");
    loadProducts();
  })
  .catch(() => alert("Failed to add product"));
}

// ================= LOAD PRODUCTS =================
function loadProducts() {
  const token = localStorage.getItem("token");

  fetch(`${BASE_URL}/api/v1.0/product/page?pageNo=0&pageSize=100`, {
    headers: {
      "Authorization": "Bearer " + token
    }
  })
  .then(res => res.json())
  .then(data => {

    console.log("Products:", data);

    const container = document.getElementById("productList");

    container.innerHTML = "";

    data.payload.forEach(p => {

      container.innerHTML += `
        <div style="padding:10px;border:1px solid #ccc;margin:10px;">
          <h3>${p.name}</h3>
          <p>Price : ₹ ${p.price}</p>
          <p>Brand : ${p.brand}</p>
          <p>Category : ${p.catagory}</p>
          <p>Description : ${p.description}</p>
        </div>
      `;
    });

  })
  .catch(err => {
    console.error(err);
    alert("Failed to load products");
  });
}

// ================= LOGOUT =================
function logout() {
  localStorage.clear();
  alert("Logged out");
  window.location.href = "login.html";
}