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

    }catch(e){

        return "";
    }
}

const role = getUserRole();

if(role !== "ADMIN"){

    alert("Access Denied");

    window.location.href =
        "products.html";
}



const token = localStorage.getItem("token");

window.onload = function () {
    loadDashboard();
};

async function loadDashboard() {

    try {

        const response = await fetch(
            "http://localhost:8080/api/dashboard",
            {
                headers: {
                    "Authorization": "Bearer " + token
                }
            }
        );

        const data = await response.json();

        document.getElementById("totalProducts").innerText =
            data.totalProducts;

        document.getElementById("totalUsers").innerText =
            data.totalUsers;

        document.getElementById("inStockProducts").innerText =
            data.inStockProducts;

        document.getElementById("outOfStockProducts").innerText =
            data.outOfStockProducts;

    } catch (error) {

        console.log(error);

        alert("Unable to load dashboard");
    }
}

function goToProducts() {
    window.location.href = "products.html";
}

function logout() {

    localStorage.removeItem("token");

    window.location.href = "login.html";
}