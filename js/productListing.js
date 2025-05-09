const mostPopProducts = document.querySelector(".most-popular-products");
let productsData = []; // Store the fetched products data

// Fetch data from JSON server
fetch("http://localhost:3000/products")
  .then((response) => response.json())
  .then((data) => {
    productsData = data; // Store the fetched data
    renderProducts(data); // Render all products initially
  })
  .catch((error) => console.error("Error fetching products:", error));

// Function to render products
function renderProducts(products) {
  mostPopProducts.innerHTML = ""; // Clear existing products

  if (products.length === 0) {
    mostPopProducts.innerHTML = `<p class="no-results">No products found.</p>`;
    return;
  }

  products.forEach((product) => {
    const { id, name, price, category, images, approved } = product;

    // Check if the product is approved
    if (approved) {
      // Create product card HTML
      mostPopProducts.innerHTML += `
        <div class="product-card" data-product-id="${id}">
          <div class="product-card__container">
            <div class="product-card__btn cart" data-tooltip="add to cart" onclick="addToCart(${id})">
              <i class="fas fa-shopping-cart"></i>
            </div>
            <div class="product-card__btn fav" data-tooltip="add to wishlist" onclick="addToWishlist(${id})">
              <i class="fas fa-heart"></i>
            </div>
            <div class="product-card__img">
              <img src="${images[0].url}" alt="${name}" />
            </div>
          </div>
          <div class="product-card__description">
            <div class="product-card__text">${name}</div>
            <div class="product-card__price">${price}</div>
            <div class="product-card__category">${category}</div>
          </div>
          <div class="product-card__color">
            ${images
              .map(
                (image) => `
              <button class="product-card__btn-radio" data-img="${image.url}">
                <span style="background-color: ${image.color};"></span>
              </button>
            `
              )
              .join("")}
          </div>
        </div>
      `;
    }
  });

  // Add event listeners for color selection buttons AFTER rendering
  addColorButtonListeners();
}

// Function to add event listeners for color selection buttons
function addColorButtonListeners() {
  const radioBtns = document.querySelectorAll(".product-card__btn-radio");

  // Set the first radio button as selected by default
  document.querySelectorAll(".product-card__color").forEach((pcc) => {
    pcc.firstElementChild.classList.add("selected");
  });

  // Add click event listeners to radio buttons
  radioBtns.forEach((radioBtn) => {
    radioBtn.addEventListener("click", () => {
      const productCard = radioBtn.closest(".product-card");
      const productImg = productCard.querySelector(".product-card__img > img");
      const proRadioBtns = productCard.querySelectorAll(".product-card__btn-radio");

      // Remove 'selected' class from all buttons in the same product card
      proRadioBtns.forEach((btn) => btn.classList.remove("selected"));

      // Add 'selected' class to the clicked button
      radioBtn.classList.add("selected");

      // Update the product image to the selected color
      productImg.src = radioBtn.dataset.img;
    });
  });
  console.log("Adding event listeners to radio buttons...");
radioBtns.forEach((radioBtn) => {
  console.log("Adding listener to:", radioBtn);
  radioBtn.addEventListener("click", () => {
    console.log("Radio button clicked:", radioBtn);
  });
});
}

// Function to filter products by name, price, and category
function filterProducts(query) {
  const filteredProducts = productsData.filter((product) => {
    const { name, price, category } = product;
    const lowerCaseQuery = query.toLowerCase();

    return (
      name.toLowerCase().includes(lowerCaseQuery) ||
      price.toString().includes(lowerCaseQuery) ||
      category.toLowerCase().includes(lowerCaseQuery)
    );
  });

  renderProducts(filteredProducts); // Re-render filtered products
}

// Add event listener for search input
document.querySelector('.search-form').addEventListener('submit', function (event) {
  event.preventDefault(); // Prevent form submission
  const searchQuery = document.getElementById('search-input').value.trim();
  filterProducts(searchQuery); // Filter products based on the search query
});

// Optional: Add real-time search (as the user types)
document.getElementById('search-input').addEventListener('input', function () {
  const searchQuery = this.value.trim();
  filterProducts(searchQuery); // Filter products in real-time
});