document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login");
  const registerForm = document.getElementById("register");
  const showRegister = document.getElementById("show-register");
  const showLogin = document.getElementById("show-login");
  const loginFormContainer = document.getElementById("login-form");
  const registerFormContainer = document.getElementById("register-form");

  // Toggle between login and register forms
  showRegister.addEventListener("click", (e) => {
    e.preventDefault();
    loginFormContainer.style.display = "none";
    registerFormContainer.style.display = "block";
  });

  showLogin.addEventListener("click", (e) => {
    e.preventDefault();
    registerFormContainer.style.display = "none";
    loginFormContainer.style.display = "block";
  });

  // Show error message
  function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.classList.add("show");
  }

  // Clear error message
  function clearError(elementId) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = "";
    errorElement.classList.remove("show");
  }

  // Password Strength Validation
  function validatePassword(password) {
    const minLength = 8;
    if (password.length < minLength) {
      return "Password must be at least 8 characters long.";
    }
    return null;
  }

  // Login Form Submission
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    // Define submitButton
    const submitButton = loginForm.querySelector("button");
    submitButton.innerHTML = '<div class="spinner"></div> Logging in...';
    submitButton.disabled = true;

    // Clear previous errors
    clearError("login-email-error");
    clearError("login-password-error");

    // Validate inputs
    if (!email || !email.includes("@")) {
      showError("login-email-error", "Please enter a valid email address.");
      submitButton.innerHTML = "Login"; // Reset button
      submitButton.disabled = false;
      return;
    }
    if (!password) {
      showError("login-password-error", "Password is required.");
      submitButton.innerHTML = "Login"; // Reset button
      submitButton.disabled = false;
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/users");
      const users = await response.json();
      const user = users.find((u) => u.email === email && u.password === password);

      if (user) {
        console.log(user.id)
        // localStorage.setItem("currentUserId", user.id); 
        if (email === "mo2.prog@gmail.com") {
          Swal.fire({
            title: "Welcome,Admin!",
            text: "You are being redirected to the admin page.",
            icon: "success",
          }).then(() => {
            window.location.href = "admin.html"; // Redirect to admin page
          });
        }else if (user.role === "seller" && user.approved) {
          localStorage.setItem("currentUserId", user.id); 
            Swal.fire({
              title: "Welcome, Seller!",
              text: `Welcome, ${user.name}!`,
              icon: "success",
            }).then(() => {
              window.location.href = `seller.html?sellerId=${user.id}`; 
            });
          } else if (user.role === "seller" && !user.approved) {
            Swal.fire({
              title: "Account Not Approved",
              text: "Your seller account is not yet approved. Please contact the administrator.",
              icon: "warning",
            });
        } 
        else {

          localStorage.setItem("currentCustomerId", user.id); 
          // Redirect to account page
          Swal.fire({
            title: "Welcome!",
            text: `Welcome, ${user.name}!`,
            icon: "success",
          }).then(() => {
            window.location.href = "index.html"; // Redirect to customer page
          });
        }
      } else {
        showError("login-password-error", "Invalid email or password.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      Swal.fire({
        title: "Error",
        text: "An error occurred. Please try again.",
        icon: "error",
      });
    } finally {
      // Reset button
      submitButton.innerHTML = "Login";
      submitButton.disabled = false;
    }
  });

  // Register Form Submission
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Get form values
    const name = document.getElementById("register-name").value;
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;
    const role = document.getElementById("register-role").value;

    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
      showError("password-error", passwordError);
      return;
    }

    // Show loading spinner
    const submitButton = registerForm.querySelector("button");
    submitButton.innerHTML = '<div class="spinner"></div> Registering...';
    submitButton.disabled = true;

    try {
      // Check if email already exists
      const response = await fetch("http://localhost:3000/users");
      const users = await response.json();
      const emailExists = users.some((u) => u.email === email);

      if (emailExists) {
        Swal.fire({
          title: "Error",
          text: "This email is already registered. Please use a different email.",
          icon: "error",
        });
        return;
      }

      // Generate random ID
      const id = await getNextId();
      const newUser = {
        id,
        name,
        email,
        password,
        role,
        order_ids: [],
        address: "",
      };

      // Send POST request to add the new user to the database
      const postResponse = await fetch("http://localhost:3000/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      if (!postResponse.ok) {
        throw new Error("Registration failed. Please try again.");
      }

      // Registration successful
      Swal.fire({
        title: "Success!",
        text: "Registration successful! Please login.",
        icon: "success",
      }).then(() => {
        window.location.href = "login.html"; // Redirect to the login page
      });
    } catch (error) {
      console.error("Error during registration:", error);
      Swal.fire({
        title: "Error",
        text: error.message || "An error occurred. Please try again.",
        icon: "error",
      });
    } finally {
      // Reset button
      submitButton.innerHTML = "Register";
      submitButton.disabled = false;
    }
  });

// Function to get the next ID by finding the maximum ID and incrementing it
async function getNextId() {
  try {
    const response = await fetch("http://localhost:3000/users");
    const users = await response.json();
    const maxId = users.reduce((max, user) => {
      const userId = parseInt(user.id, 10); 
      return userId > max ? userId : max;
    }, 0);
    return String(maxId + 1); 
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to generate ID. Please try again.");
  }
}


});