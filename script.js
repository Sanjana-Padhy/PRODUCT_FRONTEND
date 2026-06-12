const BASE_URL = "http://localhost:8080";

let currentPage = 0;
const pageSize = 5;

let editingProductId = null;

function getUserRole() {

    const token =
        localStorage.getItem("token");

    if(!token){
        return "";
    }

    try{

        const payload =
            JSON.parse(
                atob(token.split(".")[1])
            );

        const roles =
            payload.roles || [];

        if(roles.includes("ADMIN")){
            return "ADMIN";
        }

        return "USER";

    }
    catch(e){

        return "";
    }
}

function setupUI() {

    const role = getUserRole();

    if(role === "USER") {

        document.querySelector(
            "button[onclick='addProduct()']"
        ).style.display = "none";

        document.getElementById("pname").style.display = "none";
        document.getElementById("pprice").style.display = "none";
        document.getElementById("pbrand").style.display = "none";
        document.getElementById("pcategory").style.display = "none";
        document.getElementById("pdesc").style.display = "none";
        document.getElementById("pstock").style.display = "none";
        document.getElementById("pimageFile").style.display = "none";
    }
}

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

async function addProduct() {

    if(getUserRole() !== "ADMIN"){
        alert("Access Denied");
        return;
    }

  const token = localStorage.getItem("token");

 const imageUrl = await uploadImage();

const productData = {
    name: document.getElementById("pname").value,
    price: document.getElementById("pprice").value,
    brand: document.getElementById("pbrand").value,
    catagory: document.getElementById("pcategory").value,
    description: document.getElementById("pdesc").value,
    stock: document.getElementById("pstock").value,
    imageUrl: imageUrl
};

  // UPDATE
  if(editingProductId !== null){

    fetch(`${BASE_URL}/api/v1.0/product/${editingProductId}`,{
      method:"PUT",
      headers:{
        "Content-Type":"application/json",
        "Authorization":"Bearer " + token
      },
      body: JSON.stringify(productData)
    })
    .then(res => res.json())
.then(() => {

    editingProductId = null;

    clearForm();

    return loadProducts();

})
.then(() => {
    alert("Product Updated Successfully");
});

    return;
  }

// ADD NEW PRODUCT
fetch(`${BASE_URL}/api/v1.0/product`, {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
    },
    body: JSON.stringify(productData)
})
.then(async response => {

    const data = await response.json();

    if (!response.ok) {
        alert(data.payload);
        return;
    }

    alert("Product Added Successfully");

    clearForm();

    loadProducts();
})
.catch(error => {

    console.error(error);

    alert("Operation Failed");
});
}



// ======= SEARCH PRODUCT ================

function searchProduct(){

  const token = localStorage.getItem("token");

  const keyword =
      document.getElementById("searchText").value;

  fetch(
    `${BASE_URL}/api/v1.0/product/search?keyword=${keyword}`,
    {
      headers:{
        "Authorization":"Bearer " + token
      }
    }
  )
  .then(res => res.json())
  .then(data => {

    const container =
        document.getElementById("productList");

    container.innerHTML = "";

    data.payload.forEach(p => {

      container.innerHTML += `
      <div style="border:1px solid #ccc;padding:10px;margin:10px;">

        <img
        src="${p.imageUrl || 'https://picsum.photos/300/200'}"
        width="200"
        height="150"
        style="object-fit:cover;border-radius:8px;">

        <h3>${p.name}</h3>

        <p>ID : ${p.pid}</p>
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
    alert("Search Failed");
  });
}

// ================= LOAD PRODUCTS =================
// ================= LOAD PRODUCTS =================
function loadProducts() {

  const token = localStorage.getItem("token");
console.log(token);
  const sorting =
      document.getElementById("sortOrder").value;

  document.getElementById("pageInfo").innerText =
      "Page " + (currentPage + 1);

  return fetch(
    `${BASE_URL}/api/v1.0/product/page?pageNo=${currentPage}&pageSize=${pageSize}&sorting=${sorting}`,
    {
      headers:{
        "Authorization":"Bearer " + token
      }
    }
  )
  .then(res => res.json())
  .then(data => {

    console.log("Products:", data);

    const container =
        document.getElementById("productList");

    container.innerHTML = "";

    data.payload.forEach(p => {

      console.log("Image URL:", p.imageUrl);

  container.innerHTML += `
<div style="border:1px solid #ccc;padding:10px;margin:10px;">

 <img
src="${p.imageUrl || 'https://picsum.photos/300/200'}"
width="200"
height="150"
style="object-fit:cover;border-radius:8px;"
>

  <h3>${p.name}</h3>

  <p>ID : ${p.pid}</p>
  <p>Price : ₹ ${p.price}</p>
  <p>Brand : ${p.brand}</p>
  <p>Category : ${p.catagory}</p>
  <p>Description : ${p.description}</p>

${getUserRole() === "ADMIN" ? `
<button onclick="editProduct(${p.pid})">
  Edit Product
</button>

<button onclick="deleteProduct(${p.pid})">
  Delete Product
</button>
` : ""}

</div>
`;
    });

  })
  .catch(err => {
    console.error(err);
    alert("Failed to load products");
  });
}
// ================= NEXT PAGE =================
function nextPage(){

    currentPage++;

    const category =
        document.getElementById("categoryFilter").value;

    if(category !== ""){
        filterByCategory();
    }else{
        loadProducts();
    }
}

// ================= PREVIOUS PAGE =================
function previousPage(){

    if(currentPage > 0){
        currentPage--;
    }

    const category =
        document.getElementById("categoryFilter").value;

    if(category !== ""){
        filterByCategory();
    }else{
        loadProducts();
    }
}

// ============ CATEGORY ================
function filterByCategory() {

    const token = localStorage.getItem("token");

    const category =
        document.getElementById("categoryFilter").value;

    document.getElementById("pageInfo").innerText =
        "Page " + (currentPage + 1);

    if(category === ""){
        loadProducts();
        return;
    }

    fetch(
        `${BASE_URL}/api/v1.0/product/catagory?catagory=${category}&pageNo=${currentPage}&pageSize=${pageSize}`,
        {
            headers:{
                "Authorization":"Bearer " + token
            }
        }
    )
    .then(res => res.json())
    .then(products => {

        const container =
            document.getElementById("productList");

        container.innerHTML = "";

        products.forEach(p => {

            container.innerHTML += `
            <div style="border:1px solid #ccc;padding:10px;margin:10px;">
           <img
src="${p.imageUrl || 'https://picsum.photos/300/200'}"
width="200"
height="150"
style="object-fit:cover;border-radius:8px;"
>

<h3>${p.name}</h3>



                <p>ID : ${p.pid}</p>
                <p>Price : ₹ ${p.price}</p>
                <p>Brand : ${p.brand}</p>
                <p>Category : ${p.catagory}</p>
                <p>Description : ${p.description}</p>

                ${getUserRole() === "ADMIN" ? `
<button onclick="editProduct(${p.pid})">
    Edit Product
</button>

<button onclick="deleteProduct(${p.pid})">
    Delete Product
</button>
` : ""}
            </div>
            `;
        });

    })
    .catch(err => {
        console.error(err);
        alert("Failed to load category products");
    });
}

function applyFilter(){

    currentPage = 0;

    filterByCategory();
}

// ================ UPLOAD IMAGE ====================

async function uploadImage(){

    const token =
        localStorage.getItem("token");

    const file =
        document.getElementById("pimageFile")
        .files[0];

    if(!file){
        return "";
    }

    const formData = new FormData();

    formData.append("file", file);

    const response = await fetch(
        `${BASE_URL}/api/v1.0/upload`,
        {
            method:"POST",
            headers:{
                "Authorization":
                "Bearer " + token
            },
            body: formData
        }
    );

   if (!response.ok) {
    const error = await response.text();
    console.log("Upload Error:", error);
    throw new Error(error);
}

return await response.text();
}

// ======== Edit ========


function editProduct(id) {

    if(getUserRole() !== "ADMIN"){
        alert("Access Denied");
        return;
    }

  const token = localStorage.getItem("token");

  fetch(`${BASE_URL}/api/v1.0/product/${id}`, {
    headers: {
      "Authorization": "Bearer " + token
    }
  })
  .then(res => res.json())
  .then(data => {

    console.log(data);

    const p = data.payload;
    

    document.getElementById("pname").value = p.name;
    document.getElementById("pprice").value = p.price;
    document.getElementById("pbrand").value = p.brand;
    document.getElementById("pcategory").value = p.catagory;
    document.getElementById("pdesc").value = p.description;
  

    

    console.log(document.getElementById("pname"));
    console.log(document.getElementById("pprice"));
    console.log(document.getElementById("pbrand"));
    console.log(document.getElementById("pcategory"));
    console.log(document.getElementById("pdesc"));

    editingProductId = id;

document.getElementById("pname").scrollIntoView({
  behavior: "smooth"
});


alert("Product loaded for editing");

  });
}

// ======== DELECTE PRODUCT ==========


function deleteProduct(id){

    if(getUserRole() !== "ADMIN"){
        alert("Access Denied");
        return;
    }

  const token = localStorage.getItem("token");

  if(!confirm("Delete this product?")){
      return;
  }

  fetch(`${BASE_URL}/api/v1.0/product/${id}`,{
      method:"DELETE",
      headers:{
          "Authorization":"Bearer " + token
      }
  })
  .then(res => res.json())
  .then(() => {

      alert("Product Deleted Successfully");

      loadProducts();

  })
  .catch(() => {
      alert("Delete Failed");
  });

}

// ================ PROFILE ============
function goToProfile() {

    window.location.href = "profile.html";
}

// ================= LOGOUT =================
function logout() {
  localStorage.clear();
  alert("Logged out");
  window.location.href = "login.html";
}

function clearForm(){

    document.getElementById("pname").value = "";
    document.getElementById("pprice").value = "";
    document.getElementById("pbrand").value = "";
    document.getElementById("pcategory").value = "";
    document.getElementById("pdesc").value = "";
    document.getElementById("pstock").value = "";
    document.getElementById("pimageFile").value = "";
}

window.onload = function() {

    setupUI();

    loadProducts();
};