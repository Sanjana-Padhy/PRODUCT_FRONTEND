document.getElementById("sendOtpBtn")
.addEventListener("click", async () => {

    const email =
        document.getElementById("email").value;

    const response = await fetch(
        "http://localhost:8080/api/v2/user/forgot-password",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email
            })
        }
    );

    const data = await response.json();

    alert(data.payload);

    document.getElementById("otpSection").style.display = "block";
});


async function verifyOtp() {

    const email =
        document.getElementById("email").value;

    const otp =
        document.getElementById("otp").value;

    const response = await fetch(
        "http://localhost:8080/api/v2/user/verify-reset-otp",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                otp: otp
            })
        }
    );

    const data = await response.json();

    alert(data.payload);

    document.getElementById("passwordSection")
            .style.display = "block";
}



async function resetPassword() {

    const email =
        document.getElementById("email").value;

    const newPassword =
        document.getElementById("newPassword").value;

    const confirmPassword =
        document.getElementById("confirmPassword").value;

    if (newPassword !== confirmPassword) {

        alert("Passwords do not match");
        return;
    }

    const response = await fetch(
        "http://localhost:8080/api/v2/user/reset-password",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                newPassword: newPassword
            })
        }
    );

    const data = await response.json();

    alert(data.payload);

    window.location.href = "login.html";
}