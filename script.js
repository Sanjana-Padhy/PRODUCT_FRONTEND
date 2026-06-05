const BASE_URL = "http://localhost:8080";

let currentPage = 0;
const pageSize = 5;

let editingProductId = null;

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

 const productData = {
    name: document.getElementById("pname").value,
    price: document.getElementById("pprice").value,
    brand: document.getElementById("pbrand").value,
    catagory: document.getElementById("pcategory").value,
    description: document.getElementById("pdesc").value,
    imageUrl: document.getElementById("pimage").value
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
  fetch(`${BASE_URL}/api/v1.0/product`,{
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "Authorization":"Bearer " + token
    },
    body: JSON.stringify(productData)
  })
  .then(res => res.json())
  .then(() => {

    alert("Product Added Successfully");

    clearForm();

    loadProducts();
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

  <button onclick="editProduct(${p.pid})">
    Edit Product
  </button>

  <button onclick="deleteProduct(${p.pid})">
    Delete Product
  </button>

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

                <button onclick="editProduct(${p.pid})">
                    Edit Product
                </button>

                <button onclick="deleteProduct(${p.pid})">
                    Delete Product
                </button>

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

// ======== Edit ========
function editProduct(id) {

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
    document.getElementById("pimage").value = p.imageUrl;

    

    console.log(document.getElementById("pname"));
    console.log(document.getElementById("pprice"));
    console.log(document.getElementById("pbrand"));
    console.log(document.getElementById("pcategory"));
    console.log(document.getElementById("pdesc"));

    editingProductId = id;

document.getElementById("pname").scrollIntoView({
  behavior: "smooth"
});
document.getElementById("pimage").value =
    p.imageUrl || "";

alert("Product loaded for editing");

  });
}

// ======== DELECTE PRODUCT ==========
function deleteProduct(id){

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

// ================= LOGOUT =================
function logout() {
  localStorage.clear();
  alert("Logged out");
  window.location.href = "login.html";
}