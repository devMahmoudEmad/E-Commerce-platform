import { User } from './models/User.js';
import { Product } from './models/Product.js';
import { Order } from './models/Order.js';

class Dashboard {
  constructor() {
    this.currentUserId = null;
    this.modal = document.getElementById("editUserModal");
    this.editUserForm = document.getElementById("editUserForm");
    this.closeModal = document.querySelector(".close");
    this.sidebarLinks = document.querySelectorAll(".sidebar-link");
    this.contentSections = document.querySelectorAll(".content-section");

    // Add User Modal
    this.addUserModal = document.getElementById("addUserModal");
    this.addUserForm = document.getElementById("addUserForm");
    this.addUserButton = document.getElementById("addUserButton");
    this.addUserCloseModal = document.getElementById("CloseModal"); 

  
    // Search Elements
    this.userSearchInput = document.getElementById("userSearchInput");
    this.userSearchButton = document.getElementById("userSearchButton");
    this.productSearchInput = document.getElementById("productSearchInput");
    this.productSearchButton = document.getElementById("productSearchButton");
    this.orderSearchInput = document.getElementById("orderSearchInput");
    this.orderSearchButton = document.getElementById("orderSearchButton");

    this.sidebarLinks = document.querySelectorAll(".sidebar-link");
    this.contentSections = document.querySelectorAll(".content-section");

    // Add event listeners to sidebar links
    this.sidebarLinks.forEach((link) => {
      link.addEventListener("click", (e) => this.handleSidebarLinkClick(e));
    });

    // Bind event listeners
    if (this.editUserForm) {
      this.editUserForm.onsubmit = (e) => this.handleEditUserFormSubmit(e);
    }

    if (this.addUserForm) {
      this.addUserForm.onsubmit = (e) => this.handleAddUserFormSubmit(e);
    }

    if (this.addUserButton) {
      this.addUserButton.onclick = () => this.openAddUserModal();
    }
    window.onclick = (event) => {
      if (event.target === this.modal) this.modal.style.display = "none";
    };
    // Search functionality
    if (this.userSearchButton) {
      this.userSearchButton.addEventListener("click", () => this.handleUserSearch());
    }
    if (this.productSearchButton) {
      this.productSearchButton.addEventListener("click", () => this.handleProductSearch());
    }
    if (this.orderSearchButton) {
      this.orderSearchButton.addEventListener("click", () => this.handleOrderSearch());
    }

  }
  async init() {
    document.addEventListener("DOMContentLoaded", () => this.setupEventListeners());
    await this.fetchAndRender();
  }    // Close modals when clicking outside


  // Handle sidebar link clicks
  handleSidebarLinkClick(e) {
    const target = e.currentTarget.getAttribute("href");

    // Hide all sections
    this.contentSections.forEach((section) => {
      section.classList.remove("active");
      section.style.display = "none"; // Ensure sections are hidden
    });

    // Show the target section
    if (target) {
      const targetSection = document.querySelector(target);
      if (targetSection) {
        targetSection.classList.add("active");
        targetSection.style.display = "block"; 
      }
    }
  }
  // Handle User Search
  async handleUserSearch() {
    const query = this.userSearchInput.value.trim().toLowerCase();
    const users = await User.fetchAll();

    // Filter users based on the search query
    const filteredUsers = users.filter(
      (user) =>
        user.id.includes(query) || 
        user.name.toLowerCase().includes(query) || 
        user.email.toLowerCase().includes(query) || 
        user.role.toLowerCase().includes(query) || 
        (query.toLowerCase() === "approved" && user.approved) || 
        (query.toLowerCase() === "not approved" && !user.approved && user.role==="seller") 
    );

    // Render the filtered users
    this.renderTable(filteredUsers, "user-table", ["id", "name", "email", "role", "approved"], [
      { class: "approve", onclick: "approveUser", text: "Approve" },
      { class: "edit", onclick: "openEditModal", text: '<i class="ri-edit-2-line"></i>' },
      { class: "delete", onclick: "deleteUser", text: '<i class="ri-delete-bin-6-line"></i>' },
    ]);
  } 

 // Handle Product Search
 async handleProductSearch() {
  const query = this.productSearchInput.value.trim().toLowerCase();
  const products = await Product.fetchAll();

  // Filter products based on the search query

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      (query.toLowerCase() === "approved" && product.approved) || 
      (query.toLowerCase() === "not approved" && !product.approved)
  );

  // Render the filtered products
  this.renderTable(filteredProducts, "product-table", ["id", "name", "images", "price", "category", "sellerId", "approved"], [
    { class: "approve", onclick: "approveProduct", text: "Approve" },
    { class: "delete", onclick: "deleteProduct", text: '<i class="ri-delete-bin-6-line"></i>' },
  ]);
}

// Handle Order Search
async handleOrderSearch() {
  const query = this.orderSearchInput.value.trim().toLowerCase();
  const orders = await Order.fetchAll();

  // Filter orders based on the search query
  const filteredOrders = orders.filter(
    (order) =>
    order.customerName.toLowerCase().includes(query) || // Search by customer name
    order.id.toLowerCase().includes(query) ||
    order.address.toLowerCase().includes(query) ||
    order.date.toLowerCase().includes(query) ||
    String(order.total).includes(Number(query)) ||
    order.status.toLowerCase().includes(query)
  );

  // Render the filtered orders
  this.renderTable(filteredOrders, "order-table", ["id", "customerName", "products", "date", "total", "status"], [
    { class: "edit", onclick: "editOrder", text: '<i class="ri-edit-2-line"></i>' },
    { class: "delete", onclick: "deleteOrder", text: '<i class="ri-delete-bin-6-line"></i>' },
  ]);
}
   // Open Add User Modal
   openAddUserModal() {
    this.addUserModal.style.display = "block";
  }
   

  async getMaxUserId() {
    const users = await User.fetchAll();
    if (users.length === 0) return 1; 
    const maxId = Math.max(...users.map(user => user.id));
    return maxId;
  }

  async handleAddUserFormSubmit(event) {
    event.preventDefault(); 
  
    const password = document.getElementById("userPassword").value;
    const passwordConfirm = document.getElementById("userPasswordConfirm").value;
  
    // Check if passwords match
    if (password !== passwordConfirm) {
      Swal.fire({
        title: "Error!",
        text: "Passwords do not match.",
        icon: "error",
        confirmButtonColor: "#cb6be6",
      });
      return;
    }



    try {
      // Fetch the maximum user ID
      const maxId = await this.getMaxUserId();
      const newId = String(maxId + 1); 

 
      // Collect form data
      const newUser = {
        id: newId, // Assign the new ID
        name: document.getElementById("userName").value,
        email: document.getElementById("userEmail").value,
        password, // Store password as plain text
        role: document.getElementById("userRole").value,
        approved: true
      };
  
      // Send POST request to add the new user
      const response = await fetch("http://localhost:3000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
  
      if (!response.ok) throw new Error("Failed to add user.");
  
      // Show success message
      Swal.fire({
        title: "Success!",
        text: "User added successfully.",
        icon: "success",
        confirmButtonColor: "#cb6be6",
      });
  
      // Close the modal
      this.addUserModal.style.display = "none";
  
      // Refresh the user list
      await this.fetchAndRender();
    } catch (error) {
      console.error("Error adding user:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to add user. Please try again later.",
        icon: "error",
        confirmButtonColor: "#cb6be6",
      });
    }
  } 
  async fetchAndRender() {
    try {
      const [users, products, orders] = await Promise.all([
        User.fetchAll(),
        Product.fetchAll(),
        Order.fetchAll(),
      ]);
  
      // Render users table with Approve button only for sellers
      this.renderTable(users, 'user-table', ['id', 'name', 'email', 'role', 'approved'], [
        { class: 'approve', onclick: 'approveUser', text: 'Approve' },
        { class: 'edit', onclick: 'openEditModal', text: '<i class="ri-edit-2-line"></i>' },
        { class: 'delete', onclick: 'deleteUser', text: '<i class="ri-delete-bin-6-line"></i>' },
      ]);
  
      // Render products table with Approve button
      this.renderTable(products, 'product-table', ['id', 'name', 'images', 'price', 'category', 'sellerId', 'approved'], [
        { class: 'approve', onclick: 'approveProduct', text: 'Approve' },
        { class: 'delete', onclick: 'deleteProduct', text: '<i class="ri-delete-bin-6-line"></i>' },
      ]);
  
      // Render orders table
      this.renderTable(orders, 'order-table', ['id', 'customerName', 'products', 'date', 'total', 'status'], [
        { class: 'edit', onclick: 'editOrder', text: '<i class="ri-edit-2-line"></i>' },
        { class: 'delete', onclick: 'deleteOrder', text: '<i class="ri-delete-bin-6-line"></i>' },
      ]);

    } 
    catch (error) {
      console.error("Error fetching :", error);
     
    }
  }

  renderTable(data, tableId, columns, actions) {
    const table = document.querySelector(`#${tableId} tbody`);
    if (!table) {
      console.error(`Table with ID ${tableId} not found.`);
      return;
    }

    if (!data || data.length === 0) {
      table.innerHTML = `<tr><td colspan="${columns.length + actions.length}">No data found.</td></tr>`;
      return;
    }

    table.innerHTML = data
      .map((item) => {
        // Format the products array for orders
        const productsCell =
          tableId === "order-table"
            ? `<td>${this.formatProducts(item.products)}</td>`
            : `<td>${item.products || "N/A"}</td>`;

        return `
          <tr>
            ${columns
              .map((col) => {
                if (col === "products") {
                  return productsCell;
                } else if (col === "images") {
                  // Render images as thumbnails
                  return `<td>
                    ${item.images && item.images.length > 0
                      ? item.images
                          .map(
                            (image) =>
                              `<img src="${image.url}" alt="${item.name}" style="width: 50px; height: 50px; margin-right: 5px;">`
                          )
                          .join("")
                      : "No images"}
                  </td>`;
                } else {
                  return `<td>${item[col] || "N/A"}</td>`;
                }
              })
              .join("")}
            <td>
              ${actions
                .map((action) => {
                  // Show Approve button only for products or sellers
                  if (action.class === "approve") {
                    if (
                      (tableId === "product-table" && !item.approved) || // Show for unapproved products
                      (tableId === "user-table" && item.role === "seller" && !item.approved) // Show for unapproved sellers
                    ) {
                      return `<button class="${action.class}" onclick="dashboard.${action.onclick}(${item.id})">${action.text}</button>`;
                    } else {
                      return ""; // Hide Approve button for approved products or sellers
                    }
                  } else {
                    return `<button class="${action.class}" onclick="dashboard.${action.onclick}(${item.id})">${action.text}</button>`;
                  }
                })
                .join("")}
            </td>
          </tr>
        `;
      })
      .join("");
  }
  formatProducts(products) {
    if (!products || !Array.isArray(products)) return "No products";

    return products
      .map(
        (product) => `
        <div class="product-item">
          <strong>Product ID:</strong> ${product.productID}<br>
          <strong>Quantity:</strong> ${product.quantity}<br>
          <strong>Price:</strong> $${product.price}<br>
          <strong>Seller ID: ${product.sellerId}</strong> 
        </div>
      `
      )
      .join("");
  }

  setupEventListeners() {
    this.closeModal.onclick = () => this.modal.style.display = "none";
    window.onclick = (event) => {
      if (event.target === this.modal) this.modal.style.display = "none";
    };

    this.sidebarLinks.forEach(link => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const target = link.getAttribute("href");
        this.contentSections.forEach(section => section.classList.remove("active"));
        document.getElementById(target)?.classList.add("active");
      });
    });
  }

  async openEditModal(id) {
    this.currentUserId = id;
    try {
      const user = await User.fetchById(id);

      document.getElementById("editUserName").value = user.name;
      document.getElementById("editUserEmail").value = user.email;
      document.getElementById("editUserRole").value = user.role;

     
    
      this.modal.style.display = "block";
    } catch (error) {
      console.error("Error opening edit modal:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to fetch user details. Please try again later.",
        icon: "error",
        confirmButtonColor: "#cb6be6",
      });
    }
  }

  async handleEditUserFormSubmit(event) {
    event.preventDefault(); // Prevent default form submission
  
    
    try {
      // Collect updated data from the form
      const updatedData = {
        name: document.getElementById("editUserName").value,
        email: document.getElementById("editUserEmail").value,
        role: document.getElementById("editUserRole").value,


      };
   
      // Update the user using the User class
      const user = new User(this.currentUserId);
      await user.update(updatedData);

      // Show success message
      Swal.fire({
        title: "Success!",
        text: "User updated successfully.",
        icon: "success",
        confirmButtonColor: "#cb6be6",
      });

      // Close the modal
      this.modal.style.display = "none";

      // Refresh the user list
      await this.fetchAndRender();
    } catch (error) {
      console.error("Error updating user:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to update user. Please try again later.",
        icon: "error",
        confirmButtonColor: "#cb6be6",
      });
    }
  }

  async deleteUser(id) {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to undo this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });
    if (result.isConfirmed) {
      await new User(id).delete();
      await this.fetchAndRender();
  
      Swal.fire({
        title: 'Deleted!',
        text: 'The user has been deleted successfully.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    }  
  }
  async approveUser(id) {
    try {
      const user = await User.fetchById(id);
  
      // Show confirmation dialog
      const result = await Swal.fire({
        title: "Approve Seller?",
        text: `Are you sure you want to approve ${user.name}?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#cb6be6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, approve!",
      });
  
      if (result.isConfirmed) {
        // Approve the seller
        await user.approve();
  
        // Show success message
        Swal.fire({
          title: "Approved!",
          text: `${user.name} has been approved.`,
          icon: "success",
          confirmButtonColor: "#cb6be6",
        });
  
        // Refresh the user list
        await this.fetchAndRender();
      }
    } catch (error) {
      console.error("Error approving seller:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to approve seller. Please try again later.",
        icon: "error",
        confirmButtonColor: "#cb6be6",
      });
    }
  }

  async approveProduct(id) {
    try {
      const product = await Product.fetchById(id);
  
      // Show confirmation dialog
      const result = await Swal.fire({
        title: "Approve Product?",
        text: `Are you sure you want to approve ${product.name}?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#cb6be6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, approve!",
      });
  
      if (result.isConfirmed) {
        // Approve the product
        await product.approve();
  
        // Show success message
        Swal.fire({
          title: "Approved!",
          text: `${product.name} has been approved.`,
          icon: "success",
          confirmButtonColor: "#cb6be6",
        });
  
        // Refresh the product list
        await this.fetchAndRender();
      }
    } catch (error) {
      console.error("Error approving product:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to approve product. Please try again later.",
        icon: "error",
        confirmButtonColor: "#cb6be6",
      });
    }
  }

  async deleteProduct(id) {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });
  
    if (result.isConfirmed) {
      await new Product(id).delete();
      await this.fetchAndRender();
  
      Swal.fire(
        'Deleted!',
        'The product has been deleted.',
        'success'
      );
    }
  }
  

  async editOrder(id) {
    try {
      const order = await Order.fetchById(id);
  
      // Open a modal or form to edit the order
      const modal = document.getElementById("editOrderModal");
      const editOrderStatus = document.getElementById("editOrderStatus");
  
      editOrderStatus.value = order.status;
      modal.style.display = "block";
  
      // Handle form submission
      const editOrderForm = document.getElementById("editOrderForm");
      editOrderForm.onsubmit = async (e) => {
        e.preventDefault();
  
        const updatedStatus = editOrderStatus.value;
        const updatedOrder = { ...order, status: updatedStatus };
  
        await order.update(updatedOrder);
  
        // Show success message
        Swal.fire({
          title: "Success!",
          text: "Order updated successfully.",
          icon: "success",
          confirmButtonColor: "#cb6be6",
        });
  
        // Close the modal and refresh the order list
        modal.style.display = "none";
        await this.fetchAndRender();
      };
  
      // Close modal when clicking the X icon
      const closeButton = modal.querySelector(".close");
      closeButton.onclick = () => {
        modal.style.display = "none";
      };
  
      // Close modal when clicking outside
      window.onclick = (event) => {
        if (event.target === modal) {
          modal.style.display = "none";
        }
      };
    } catch (error) {
      console.error("Error editing order:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to edit order. Please try again later.",
        icon: "error",
        confirmButtonColor: "#cb6be6",
      });
    }
  }
  async deleteOrder(id) {
    try {
      const result = await Swal.fire({
        title: "Delete Order?",
        text: "Are you sure you want to delete this order?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      });
  
      if (result.isConfirmed) {
        const order = new Order(id);
        await order.delete();
  
        // Show success message
        Swal.fire({
          title: "Deleted!",
          text: "The order has been deleted.",
          icon: "success",
          confirmButtonColor: "#cb6be6",
        });
  
        // Refresh the order list
        await this.fetchAndRender();
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to delete order. Please try again later.",
        icon: "error",
        confirmButtonColor: "#cb6be6",
      });
    }
  }
}

window.dashboard = new Dashboard();
window.dashboard.init();