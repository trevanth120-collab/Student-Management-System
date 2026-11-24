const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

loginForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const formData = new URLSearchParams();

    formData.append("username", username);
    formData.append("password", password);

    try {

        const response = await fetch("http://127.0.0.1:8000/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Login failed");
        }

        localStorage.setItem("access_token", data.access_token);

        loginMessage.textContent = "Login successful!";

        window.location.href = "index.html";

    } catch (error) {

        loginMessage.textContent = error.message;
        loginMessage.style.color = "red";

    }

});