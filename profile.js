async function loadProfile() {

    const token = localStorage.getItem("token");

    if (!token) {
        alert("Please login first");
        window.location.href = "login.html";
        return;
    }

    try {

        const response = await fetch(
            "http://localhost:8080/api/v1.0/profile",
            {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + token
                }
            }
        );

        const data = await response.json();

        document.getElementById("name").innerText =
            data.name;

        document.getElementById("email").innerText =
            data.email;

        document.getElementById("role").innerText =
            data.role;

    }
    catch(error) {

        console.error(error);

        alert("Failed to load profile");
    }
}

loadProfile();