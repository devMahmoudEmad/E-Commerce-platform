import { Product } from "./models/Product.js";
import { Order } from "./models/Order.js";

async function getMaxOrderId() {
  try {
    const response = await fetch("http://localhost:3000/orders");
    if (!response.ok) throw new Error("Failed to fetch orders.");
    const orders = await response.json();

    if (orders.length === 0) return 1; // If no orders exist, start with ID 1

    const maxId = Math.max(...orders.map((order) => order.id));
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
  const response = await fetch(`http://localhost:3000/users/${userId}`);
  if (!response.ok) throw new Error("Failed to fetch user data.");
  return await response.json();
}

// Function to fetch and display orders for the logged-in user only
async function displayOrders() {
  const ordersList = document.querySelector(".orders-list");
  try {
    // 1. Get current user ID from localStorage
    const userId = localStorage.getItem("currentCustomerId");
    if (!userId) {
      ordersList.innerHTML = `<tr><td colspan="7" style="text-align: center;">Please log in to view your orders.</td></tr>`;
      return;
    }
    // 2. Fetch user data
    const user = await fetchUserData(userId);

    // 3. Fetch all orders
    const response = await fetch("http://localhost:3000/orders");
    if (!response.ok) throw new Error("Failed to fetch orders.");
    const orders = await response.json();

    // 4. Filter orders for this user (by email or name)
    const userOrders = orders.filter(
      (order) =>
        (order.customerEmail &&
          user.email &&
          order.customerEmail === user.email) ||
        (order.customerName && user.name && order.customerName === user.name)
    );

    ordersList.innerHTML = "";

    if (userOrders.length === 0) {
      ordersList.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center;">No orders found.</td>
        </tr>
      `;
      return;
    }

    for (const order of userOrders) {
      const total = parseFloat(order.total).toFixed(2);
      const products = await Promise.all(
        order.products.map(async (product) => {
          const productData = await Product.fetchById(product.productID);
          return `${productData.name} (Qty: ${product.quantity}, Price: $${product.price})`;
        })
      );
      ordersList.innerHTML += `
        <tr class="order-item" data-order-id="${order.id}">
          <td>${order.id}</td>
          <td>${order.date}</td>
          <td>${order.customerName}</td>
          <td>${products.join(", ")}</td>
          <td>$${total}</td>
          <td><span class="status ${order.status.toLowerCase()}">${
        order.status
      }</span></td>
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

document
  .querySelector("#order-form")
  .addEventListener("submit", async (event) => {
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
