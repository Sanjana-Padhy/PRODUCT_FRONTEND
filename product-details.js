const BASE_URL = "http://localhost:8080";

const token =
    localStorage.getItem("token");

const params =
    new URLSearchParams(
        window.location.search
    );

const productId =
    params.get("id");

window.onload = function(){

    loadProductDetails();
};

async function loadProductDetails(){

    try{

        const response =
            await fetch(
                `${BASE_URL}/api/v1.0/product/${productId}`,
                {
                    headers:{
                        "Authorization":
                        "Bearer " + token
                    }
                }
            );

        const data =
            await response.json();

        const p =
            data.payload;

        document.getElementById(
            "productId"
        ).innerText = p.pid;

        document.getElementById(
            "productName"
        ).innerText = p.name;

        document.getElementById(
            "productBrand"
        ).innerText = p.brand;

        document.getElementById(
            "productCategory"
        ).innerText = p.catagory;

        document.getElementById(
         "productPrice"
        ).innerText =
        Number(p.price).toLocaleString("en-IN");

        const stockElement =
document.getElementById("productStock");

if(p.stock > 0){

    stockElement.innerText =
    "In Stock";

    stockElement.className =
    "badge bg-success";

}
else{

    stockElement.innerText =
    "Out Of Stock";

    stockElement.className =
    "badge bg-danger";

}
        document.getElementById(
            "productDescription"
        ).innerText = p.description;

      const image =
document.getElementById("productImage");

image.src =
p.imageUrl
?
p.imageUrl
:
"https://picsum.photos/600";

image.onerror=function(){

    this.src="https://picsum.photos/600";

};

    }
    catch(error){

        console.log(error);

        alert(
            "Unable to load product"
        );
    }
}

function goBack(){

    window.location.href =
        "products.html";
}