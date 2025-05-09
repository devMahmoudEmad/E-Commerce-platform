// Wishlist functionality
let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
const wishlistItemsContainer = document.querySelector(".wishlist-items");
const wishlistItemCount = document.getElementById("wishlist-item-count");


window.addToWishlist = function (productId) {
  console.log("Add to Wishlist clicked. Product ID:", productId); // Debugging

  const existingItem = wishlist.find((item) => item.id === productId);

  if (!existingItem) {
    wishlist.push({ id: productId });
  }

  // Save updated wishlist to localStorage
  localStorage.setItem("wishlist", JSON.stringify(wishlist));

  // Update UI
  updateWishlistCounter();
  displayWishlistItems();

  // Show success message
  Swal.fire({
    title: "Added to Wishlist!",
    text: "The product has been added to your wishlist.",
    icon: "success",
    confirmButtonColor: "#fd5d5c",
  });
};

// Update wishlist counter
function updateWishlistCounter() {
  const wishlistCounter = document.getElementById("wishlist-counter");
  if (wishlistCounter) {
    wishlistCounter.textContent = wishlist.length;
  }
}


function displayWishlistItems() {
  const wishlistItemsContainer = document.querySelector(".wishlist-items");
  if (!wishlistItemsContainer) return; // Exit if the container doesn't exist

  wishlistItemsContainer.innerHTML = "";

  if (wishlist.length === 0) {
    wishlistItemsContainer.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center;">Your wishlist is empty.</td>
      </tr>
    `;
    return;
  }

  wishlist.forEach((item) => {
    fetch(`http://localhost:3000/products/${item.id}`)
      .then((response) => response.json())
      .then((product) => {
        wishlistItemsContainer.innerHTML += `
          <tr class="wishlist-item" data-product-id="${product.id}">
            <td>
              <img src="${product.images[0].url}" alt="${product.name}" />
              <span>${product.name}</span>
            </td>
            <td>${product.price}</td>
            <td>
              <button class="move-to-cart-btn" onclick="moveToCart(${product.id})">Move to Cart</button>
            </td>
            <td>
              <button class="remove-btn" onclick="removeFromWishlist(${product.id})">Remove</button>
            </td>
          </tr>
        `;
      })
      .catch((error) => {
        console.error("Error fetching product details:", error);
        // Remove invalid item from the wishlist
        const updatedWishlist = wishlist.filter((wishlistItem) => wishlistItem.id !== item.id);
        localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
        wishlist = updatedWishlist;
        updateWishlistCounter();
      });
  });
}

// Move to cart function
window.moveToCart = function (productId) {
  addToCart(productId);
  removeFromWishlist(productId);
};

// Remove from wishlist function
window.removeFromWishlist = function (productId) {
  const updatedWishlist = wishlist.filter((item) => item.id !== productId);
  localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
  wishlist = updatedWishlist;
  updateWishlistCounter();
  displayWishlistItems();

  Swal.fire({
    title: "Removed!",
    text: "The product has been removed from your wishlist.",
    icon: "success",
    confirmButtonColor: "#fd5d5c",
  });
};

// Load wishlist items on page load
window.addEventListener("load", () => {
  wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  updateWishlistCounter();
  displayWishlistItems();
});