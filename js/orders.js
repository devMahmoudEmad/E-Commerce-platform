import { Product } from './models/Product.js';
import { Order } from './models/Order.js';

async function getMaxOrderId() {
  try {
    const response = await fetch("http://localhost:3000/orders");
    if (!response.ok) throw new Error("Failed to fetch orders.");
    const orders = await response.json();

    if (orders.length === 0) return 1; // If no orders exist, start with ID 1

    const maxId = Math.max(...orders.map(order => order.id));
    return string(maxId + 1); // Increment the maximum ID by 1
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
}

async function createOrder(newOrder) {
  try {
    // Generate a new order ID
    newOrder.id = await getMaxOrderId();

    const response = await fetch("http://localhost:3000/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newOrder),
    });

    if (!response.ok) throw new Error("Failed to create order.");

    // Refresh the orders list to display the new order
    displayOrders();
  } catch (error) {
    console.error("Error creating order:", error);
  }
}

async function fetchUserData(userId) {
  try {
    const response = await fetch(`http://localhost:3000/users/${userId}`);
    if (!response.ok) throw new Error("Failed to fetch user data.");
    return await response.json();
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
}
// Function to fetch and display orders
async function displayOrders() {
  console.log("Fetching orders...");
  const ordersList = document.querySelector(".orders-list");

  try {
    const response = await fetch("http://localhost:3000/orders");
    console.log("Response:", response);
    if (!response.ok) throw new Error("Failed to fetch orders.");
    const orders = await response.json();
    console.log("Orders:", orders);

    ordersList.innerHTML = "";

    if (orders.length === 0) {
      ordersList.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center;">No orders found.</td>
        </tr>
      `;
      return;
    }

    for (const order of orders) {
      console.log("Processing order:", order);
      const total = parseFloat(order.total).toFixed(2);
      const products = await Promise.all(
        order.products.map(async (product) => {
          const productData = await Product.fetchById(product.productID);
          return `${productData.name} (Qty: ${product.quantity}, Price: $${product.price})`;
        })
      );

      const productImage = order.products[0].image; 

      ordersList.innerHTML += `
        <tr class="order-item" data-order-id="${order.id}">
          <td>${order.id}</td>
          <td>${order.date}</td>
          <td>${order.customerName}</td>
          <td>${products.join(", ")}</td>
          <td>$${total}</td>
          <td><span class="status ${order.status.toLowerCase()}">${order.status}</span></td>
        </tr>
      `;
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
    ordersList.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center;">Failed to load orders.</td>
      </tr>
    `;
  }
}

// Load orders on page load
window.addEventListener("load", displayOrders);



document.querySelector("#order-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  // Fetch user data (replace 'userId' with the actual user ID)
  // const userId = "1"; // Replace with dynamic user ID if needed
  const userId = localStorage.getItem("currentCustomerId");
  console.log(userId);
  const userData = await fetchUserData(userId);

  // Create the new order object
  const newOrder = {
    id: await getMaxOrderId(), // Generate a unique ID
    customerName: userData.name, // Use the user's name
    customerEmail: userData.email, // Include the user's email
    products: [
      {
        productID: "35", // Replace with dynamic product ID if needed
        quantity: 3, // Replace with dynamic quantity if needed
        price: 100, // Replace with dynamic price if needed
        sellerId: localStorage.getItem("currentUserId"), // Replace with dynamic seller ID if needed
      },
    ],
    address: document.querySelector("#address").value,
    date: new Date().toLocaleString(),
    total: parseFloat(document.querySelector("#total").value).toFixed(2),
    status: document.querySelector("#status").value,
  };

  await createOrder(newOrder);
  

  // Clear the form after submission
  event.target.reset();
});



// Load orders on page load
window.addEventListener("load", displayOrders);
