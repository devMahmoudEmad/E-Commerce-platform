document.addEventListener("DOMContentLoaded", () => {
    const profileName = document.getElementById("profile-name");
    const profileEmail = document.getElementById("profile-email");
    const profileRole = document.getElementById("profile-role");
    const updateForm = document.getElementById("update-profile-form");
    const updateNameInput = document.getElementById("update-name");
    const updateEmailInput = document.getElementById("update-email");
    const updatePasswordInput = document.getElementById("update-password");
    const confirmPasswordInput = document.getElementById("confirm-password");
  
    // Get the current user ID from localStorage
    const currentUserId = localStorage.getItem("currentCustomerId");
  
    if (!currentUserId) {
      alert("User not logged in. Redirecting to login page...");
      window.location.href = "login.html"; // Redirect to login page if no user ID is found
      return;
    }
  
    // Fetch current user data based on ID
    async function fetchUserProfile() {
      try {
        const response = await fetch(`http://localhost:3000/users/${currentUserId}`);
        if (!response.ok) throw new Error("Failed to fetch user profile.");
        const user = await response.json();
  
        // Display user data
        profileName.textContent = user.name;
        profileEmail.textContent = user.email;
        profileRole.textContent = user.role;
  
        // Populate form fields
        updateNameInput.value = user.name;
        updateEmailInput.value = user.email;
      } catch (error) {
        console.error("Error fetching user profile:", error);
        alert("Failed to load profile data. Please try again later.");
      }
    }
  
    // Handle form submission
    updateForm.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const name = updateNameInput.value;
      const email = updateEmailInput.value;
      const password = updatePasswordInput.value;
      const confirmPassword = confirmPasswordInput.value;
  
      // Validate passwords match
      if (password  !== confirmPassword) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Passwords do not match.'
        });
        return;
      }
  
      // Prepare updated data
      const updatedData = { name, email };
      if (password) updatedData.password = password;
  
      try {
        // Send update request
        const response = await fetch(`http://localhost:3000/users/${currentUserId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedData),
        });
  
        if (!response.ok) throw new Error("Failed to update profile.");
  
        // Refresh profile data
        fetchUserProfile();
        alert("Profile updated successfully!");
      } catch (error) {
        console.error("Error updating profile:", error);
        alert("Failed to update profile. Please try again later.");
      }
    });
  
    // Load user profile on page load
    fetchUserProfile();
  });