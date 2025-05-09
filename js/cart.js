document.addEventListener("DOMContentLoaded", () => {
    const mostPopProducts = document.querySelector(".most-popular-products");
  
    fetch("http://localhost:3000/products")
      .then((response) => response.json())
      .then((data) => {
        data.forEach((product) => {
          const { id, name, price, category, images, approved } = product;
  
          if (approved) {
            mostPopProducts.innerHTML += `
              <div class="product-card" data-product-id="${id}">
                <div class="product-card__container">
                  <div class="product-card__btn cart" data-tooltip="add to cart" onclick="addToCart(${id})">
                    <i class="fas fa-shopping-cart"></i>
                  </div>
                  <div class="product-card__btn fav" data-tooltip="add to wishlist">
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
  
        // Add event listeners for color selection buttons
        document.querySelectorAll(".product-card__color").forEach((pcc) => {
          pcc.firstElementChild.classList.add("selected");
        });
  
        document.addEventListener("click", (event) => {
          if (event.target.classList.contains("product-card__btn-radio")) {
            const radioBtn = event.target;
            const productCard = radioBtn.closest(".product-card");
            const productImg = productCard.querySelector(".product-card__img > img");
            const proRadioBtns = productCard.querySelectorAll(".product-card__btn-radio");
  
            proRadioBtns.forEach((btn) => btn.classList.remove("selected"));
            radioBtn.classList.add("selected");
            productImg.src = radioBtn.dataset.img;
          }
        });
      })
      .catch((error) => console.error("Error fetching products:", error));
  });
  
  // Cart functionality
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartItemsContainer = document.querySelector(".cart-items");
  const cartTotal = document.getElementById("cart-total");
  const cartItemCount = document.getElementById("cart-item-count");
  
  // Add to cart function
  window.addToCart = function (productId) {
    const existingItem = cart.find((item) => item.id === productId);
  
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ id: productId, quantity: 1 });
    }
  
    // Save updated cart to localStorage
    localStorage.setItem("cart", JSON.stringify(cart));
  
    // Update UI
    updateCartCounter();
    displayCartItems();
  
    // Show success message
    Swal.fire({
      title: "Added to Cart!",
      text: "The product has been added to your cart.",
      icon: "success",
      confirmButtonColor: "#fd5d5c",
    });
  };
  
  // Update cart counter
  function updateCartCounter() {
    const cartCounter = document.getElementById("cart-counter");
    if (cartCounter) {
      cartCounter.textContent = cart.length;
    }
  }
  
  
  function displayCartItems() {
    const cartItemsContainer = document.querySelector(".cart-items");
  
    // Check if the cart items container exists
    if (!cartItemsContainer) {
      console.warn("Cart items container not found on this page.");
      return; // Exit the function if the container doesn't exist
    }
    
    let total = 0;
    cartItemsContainer.innerHTML = "";
    
    if (cart.length === 0) {
      cartItemsContainer.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center;">Your cart is empty.</td>
        </tr>
      `;
      if (cartTotal) {
        cartTotal.textContent = "0.00";
      }
      return;
    }
  
    cart.forEach((item) => {
      fetch(`http://localhost:3000/products/${item.id}`)
        .then((response) => response.json())
        .then((product) => {
          // Clean and parse the price
          const priceString = product.price || "0";
          const cleanedPrice = priceString.replace(/[^0-9.-]+/g, "");
          const price = parseFloat(cleanedPrice);
          console.log(price); // Output: 3690
  
          if (isNaN(price)) {
            console.error("Invalid price for product:", product);
            return;
          }
  
          const quantity = parseInt(item.quantity);
          const itemTotal = price * quantity;
  
          cartItemsContainer.innerHTML += `
            <tr class="cart-item" data-product-id="${product.id}">
              <td>
                <img src="${product.images[0].url}" alt="${product.name}" />
                <span>${product.name}</span>
              </td>
              <td>$${price.toFixed(2)}</td>
              <td>
                <input
                  type="number"
                  class="quantity-input"
                  value="${item.quantity}"
                  min="1"
                  onchange="updateQuantity(${product.id}, this.value)"
                />
              </td>
              <td>$${itemTotal.toFixed(2)}</td>
              <td>
                <button class="remove-btn" onclick="removeFromCart(${product.id})">Remove</button>
              </td>
            </tr>
          `;
  
          total += itemTotal;
          if (cartTotal) {
            cartTotal.textContent = total.toFixed(2);
          }
        })
        .catch((error) => {
          console.error("Error fetching product details:", error);
          // Remove invalid item from the cart
          const updatedCart = cart.filter((cartItem) => cartItem.id !== item.id);
          localStorage.setItem("cart", JSON.stringify(updatedCart));
          cart = updatedCart;
          updateCartCounter();
        });
    });
  }
  
  // Update quantity
  window.updateQuantity = function (productId, quantity) {
    const parsedQuantity = parseInt(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity < 1) {
      alert("Please enter a valid quantity.");
      return;
    }
  
    const updatedCart = cart.map((item) =>
      item.id === productId ? { ...item, quantity: parsedQuantity } : item
    );
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    cart = updatedCart;
    displayCartItems();
  };
  
  // Remove from cart
  window.removeFromCart = function (productId) {
    const updatedCart = cart.filter((item) => item.id !== productId);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    cart = updatedCart;
    updateCartCounter();
    displayCartItems();
  
    Swal.fire({
      title: "Removed!",
      text: "The product has been removed from your cart.",
      icon: "success",
      confirmButtonColor: "#fd5d5c",
    });
  };
  
  
  
  // Function to open checkout modal
  function openCheckoutModal() {
    if (cart.length === 0) {
      Swal.fire({
        title: "Cart is Empty!",
        text: "Your cart is empty. Add some products before proceeding to checkout.",
        icon: "warning",
        confirmButtonColor: "#fd5d5c",
      });
      return;
    }
  
    const modal = document.getElementById("checkout-modal");
    if (modal) {
      modal.style.display = "flex";
    }
  }
  
  // Function to close checkout modal
  function closeCheckoutModal() {
    const modal = document.getElementById("checkout-modal");
    if (modal) {
      modal.style.display = "none";
    }
  }

  async function confirmPurchase() {
    try {
      // Fetch the current customer's data
      const customerId = localStorage.getItem("currentCustomerId");
      if (!customerId) throw new Error("Customer ID not found in local storage.");
      const customerResponse = await fetch(`http://localhost:3000/users/${customerId}`);
      if (!customerResponse.ok) throw new Error("Failed to fetch customer data.");
      const customerData = await customerResponse.json();
  
      // Fetch the cart data from localStorage
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      if (cart.length === 0) throw new Error("Cart is empty.");
  
      // Initialize variables for the order
      let total = 0;
      const orderProducts = [];
  
      // Iterate over the cart to fetch product details and calculate the total
      await Promise.all(
        cart.map(async (item) => {
          try {
            // Fetch product details for each item in the cart
            const productResponse = await fetch(`http://localhost:3000/products/${item.id}`);
            if (!productResponse.ok) throw new Error(`Failed to fetch product details for product ID: ${item.id}`);
            const productData = await productResponse.json();
  
            // Ensure the price is a valid number
            const priceString = productData.price || "0";
            const cleanedPrice = priceString.replace(/[^0-9.-]+/g, "");
            const price = parseFloat(cleanedPrice);
            // const price = parseFloat(productData.price);
            if (isNaN(price)) throw new Error(`Invalid price for product ID: ${item.id}`);
  
            // Calculate the item total
            const itemTotal = price * item.quantity;
  
            // Add the product to the order
            orderProducts.push({
              productID: item.id,
              quantity: item.quantity,
              price: price.toFixed(2), // Include the price
              sellerId: productData.sellerId, // Include the sellerId
            });
  
            // Add to the total order amount
            total += itemTotal;
          } catch (error) {
            console.error("Error processing cart item:", error);
            // Remove invalid item from the cart
            const updatedCart = cart.filter((cartItem) => cartItem.id !== item.id);
            localStorage.setItem("cart", JSON.stringify(updatedCart));
          }
        })
      );
  
      // Fetch the maximum order ID and increment it by 1
      const maxOrderIdResponse = await fetch("http://localhost:3000/orders");
      if (!maxOrderIdResponse.ok) throw new Error("Failed to fetch orders.");
      const orders = await maxOrderIdResponse.json();
      const maxOrderId = orders.length > 0 ? Math.max(...orders.map(order => order.id)) : 0;
      const newOrderId = maxOrderId + 1;
  
      // Create the order object with dynamic customer data
      const order = {
        id: newOrderId, // Incremented order ID
        customerName: customerData.name, // Dynamic customer name
        customerEmail: customerData.email, // Dynamic customer email
        products: orderProducts, // Products from the cart
        address: customerData.address, // Dynamic customer address
        date: new Date().toLocaleString(),
        total: total.toFixed(2), // Dynamic total price
        status: "Pending",
      };
  
      // Save the order to the JSON server
      const response = await fetch("http://localhost:3000/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(order),
      });
  
      if (!response.ok) throw new Error("Failed to save order.");
  
      // Clear the cart
      localStorage.removeItem("cart");
      updateCartCounter(); // Update the cart counter in the navbar
  
      // Close the modal
      closeCheckoutModal();
  
      // Show success message
      Swal.fire({
        title: "Order Placed!",
        text: "Your order has been placed successfully.",
        icon: "success",
        confirmButtonColor: "#fd5d5c",
      }).then(() => {
        // Redirect to the orders page
        window.location.href = "orders.html";
      });
    } catch (error) {
      console.error("Error saving order:", error);
      Swal.fire({
        title: "Error!",
        text: error.message || "Failed to place the order.",
        icon: "error",
        confirmButtonColor: "#fd5d5c",
      });
    }
  }
  // Load cart items on page load
  window.addEventListener("load", () => {
    updateCartCounter();
    displayCartItems();
  });