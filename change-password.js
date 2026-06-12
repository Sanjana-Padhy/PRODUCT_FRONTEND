async function changePassword() {

    const token =
        localStorage.getItem("token");

    const oldPassword =
        document.getElementById("oldPassword").value;

    const newPassword =
        document.getElementById("newPassword").value;

    const confirmPassword =
        document.getElementById("confirmPassword").value;

    try {

        const response = await fetch(
            "http://localhost:8080/api/v1.0/password",
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization":
                        "Bearer " + token
                },

                body: JSON.stringify({
                    oldPassword,
                    newPassword,
                    confirmPassword
                })
            }
        );

        const message =
            await response.text();

        alert(message);

    } catch(error) {

        console.error(error);

        alert("Failed to change password");
    }
}