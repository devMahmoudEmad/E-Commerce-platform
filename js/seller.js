import { Product } from "./models/Product.js";
import { Order } from "./models/Order.js";

class DashboardSeller {
  constructor(sellerId) {
    this.sellerId = sellerId;
    this.currentProductId = null;
    this.modal = document.getElementById("productModal");
    this.productForm = document.getElementById("productForm");
    this.modalTitle = document.getElementById("modalTitle");
    this.closeModal = document.querySelector(".close");
    this.currentPage = 1;
    this.rowsPerPage = 5;
    // Bind event listeners
    if (this.productForm) {
      this.productForm.onsubmit = (e) => this.handleProductFormSubmit(e);
    }

    if (this.closeModal) {
      this.closeModal.onclick = () => (this.modal.style.display = "none");
    }

    window.onclick = (event) => {
      if (event.target === this.modal) {
        this.modal.style.display = "none";
      }
    };

    // Add Product Button
    const addProductButton = document.getElementById("addProductButton");
    if (addProductButton) {
      addProductButton.addEventListener("click", () => this.openProductModal());
    }

    // Search Elements
    this.productSearchInput = document.getElementById("productSearchInput");
    this.productSearchButton = document.getElementById("productSearchButton");
    this.orderSearchInput = document.getElementById("orderSearchInput");
    this.orderSearchButton = document.getElementById("orderSearchButton");

    if (this.productSearchButton) {
      this.productSearchButton.addEventListener("click", () =>
        this.handleProductSearch()
      );
    }
    if (this.orderSearchButton) {
      this.orderSearchButton.addEventListener("click", () =>
        this.handleOrderSearch()
      );
    }
    // Initialize Orders
    this.initializeOrders();
  }

  openProductModal() {
    this.currentProductId = null; // Reset the product ID for adding a new product
    this.modalTitle.textContent = "Add New Product";
    this.productForm.reset(); // Reset the form
    this.modal.style.display = "block"; // Show the modal
  }

  // async init() {
  //   await this.fetchAndRender();
  // }
  async init() {
    await this.fetchAndRenderProducts();
    // await this.fetchAndRenderOrders();
    await this.initializeOrders(); // Initialize and display seller-specific orders
  }

  // Fetch and render products for the seller
  async fetchAndRenderProducts() {
    try {
      const products = await Product.fetchAll();
      const sellerProducts = products.filter(
        (product) => product.sellerId == this.sellerId
      );
      this.renderTable(
        sellerProducts,
        "product-table",
        ["id", "name", "images", "price", "category", "approved"],
        [
          {
            class: "edit",
            onclick: "dashboardSeller.openEditProductModal",
            text: '<i class="ri-edit-2-line"></i>',
          },
          {
            class: "delete",
            onclick: "dashboardSeller.deleteProduct",
            text: '<i class="ri-delete-bin-6-line"></i>',
          },
        ]
      );
    } catch (error) {
      console.error("Error fetching products:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load products. Please try again later.",
      });
    }
  }

  async initializeOrders() {
    try {
      const orders = await Order.fetchAll();
      const sellerOrders = orders.filter((order) =>
        order.products.some((product) => product.sellerId === this.sellerId)
      );
      this.renderTable(
        sellerOrders,
        "order-table",
        [
          "id",
          "customerName",
          "products",
          "address",
          "date",
          "total",
          "status",
        ],
        [
          {
            class: "edit",
            onclick: "dashboardSeller.editOrder",
            text: '<i class="ri-edit-2-line"></i>',
          },
        ]
      );
    } catch (error) {
      console.error("Error fetching orders:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load orders. Please try again later.",
      });
    }
  }

  // Handle Product Search
  async handleProductSearch() {
    const query = this.productSearchInput.value.trim().toLowerCase();
    try {
      const products = await Product.fetchAll();
      const sellerProducts = products.filter(
        (product) => product.sellerId === this.sellerId
      );
      const filteredProducts = sellerProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query)
      );
      this.renderTable(
        filteredProducts,
        "product-table",
        ["id", "name", "images", "price", "category", "approved"],
        [
          {
            class: "edit",
            onclick: "dashboardSeller.openEditProductModal",
            text: '<i class="ri-edit-2-line"></i>',
          },
          {
            class: "delete",
            onclick: "dashboardSeller.deleteProduct",
            text: '<i class="ri-delete-bin-6-line"></i>',
          },
        ]
      );
    } catch (error) {
      console.error("Error searching products:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to search products. Please try again later.",
      });
    }
  }

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
    this.renderTable(
      filteredOrders,
      "order-table",
      ["id", "customerName", "products", "address", "date", "total", "status"],
      [
        {
          class: "edit",
          onclick: "editOrder",
          text: '<i class="ri-edit-2-line"></i>',
        },
        {
          class: "delete",
          onclick: "deleteOrder",
          text: '<i class="ri-delete-bin-6-line"></i>',
        },
      ]
    );
  }

  // Open Product Modal for Adding/Editing
  async openEditProductModal(id = null) {
    this.currentProductId = id;

    if (id) {
      // Editing an existing product
      this.modalTitle.textContent = "Edit Product";
      console.log(typeof id);
      await this.populateProductForm(id);
    } else {
      // Adding a new product
      this.modalTitle.textContent = "Add New Product";
      this.productForm.reset();
    }

    this.modal.style.display = "block";
  }

  // Populate the product form with existing data
  async populateProductForm(id) {
    try {
      const product = await Product.fetchById(id);
      console.log(id);
      console.log(typeof id);
      document.getElementById("productName").value = product.name;
      document.getElementById("productPrice").value = product.price.replace(
        "$",
        ""
      ); // Remove "$" for editing
      document.getElementById("productCategory").value = product.category;
      // document.getElementById("productColor").value = product.color;

      // Handle images differently if it's a file input
      const imagesInput = document.getElementById("productImages");
      if (imagesInput && imagesInput.type !== "file") {
        imagesInput.value = product.images.map((image) => image.url).join(", ");
      } else {
        // Display images as thumbnails or in a different way
        const imagesContainer = document.getElementById("imagesContainer");
        if (imagesContainer) {
          imagesContainer.innerHTML = product.images
            .map(
              (image) => `
            <img src="${image.url}" alt="${product.name}" style="width: 50px; height: 50px; margin-right: 5px;">
          `
            )
            .join("");
        }
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load product details. Please try again later.",
      });
    }
  }

  // Handle Product Form Submission
  async handleProductFormSubmit(e) {
    e.preventDefault();

    const productData = {
      name: document.getElementById("productName").value,
      price: `$${parseFloat(
        document.getElementById("productPrice").value
      ).toFixed(2)}`, // Add "$" and format price
      category: document.getElementById("productCategory").value,
      images: document
        .getElementById("productImages")
        .value.split(",")
        .map((url) => ({
          url: url.trim(),
          color: document.getElementById("productColor").value.trim(), // Add color from the form
        })),
      sellerId: this.sellerId,
      approved: false, // New products are not approved by default
    };

    try {
      if (this.currentProductId) {
        // Update existing product
        const product = new Product(this.currentProductId);
        await product.update(productData);
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Product updated successfully!",
        });
      } else {
        // Add new product
        await Product.addProduct(productData);
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Product added successfully!",
        });
      }

      this.modal.style.display = "none";
      await this.fetchAndRenderProducts(); // Refresh the product list
    } catch (error) {
      console.error("Error saving product:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to save product. Please try again later.",
      });
    }
  }

  // Delete Product
  async deleteProduct(id) {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You will not be able to recover this product!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const product = new Product(id);
        await product.delete();
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Product deleted successfully!",
        });
        await this.fetchAndRenderProducts(); // Refresh the product list
      } catch (error) {
        console.error("Error deleting product:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete product. Please try again later.",
        });
      }
    }
  }

  // Initialize Orders
  async initializeOrders() {
    try {
      const orders = await Order.fetchAll();
      console.log("Seller ID:", this.sellerId);
      console.log("Fetched orders:", orders);
      // const sellerOrders = orders.filter(order =>
      //   order.products.some(product => product.sellerId === this.sellerId)
      // );

      const sellerOrders = orders.filter((order) => {
        // Ensure products is defined and is an array
        if (!Array.isArray(order.products)) {
          console.warn("Invalid or missing products in order:", order);
          return false; // Skip this order
        }
        return order.products.some(
          (product) => String(product.sellerId) === String(this.sellerId)
        );
      });
      this.renderTable(
        sellerOrders,
        "order-table",
        ["id", "customerName", "products", "date", "total", "status"],
        [
          {
            class: "edit",
            onclick: "dashboardSeller.editOrder",
            text: '<i class="ri-edit-2-line"></i>',
          },
        ]
      );
    } catch (error) {
      console.error("Error fetching orders:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load orders. Please try again later.",
      });
    }
  }

  // Edit Order Status
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

  renderTable(data, tableId, columns, actions) {
    const table = document.querySelector(`#${tableId} tbody`);
    if (!table) {
      console.error(`Table with ID ${tableId} not found.`);
      return;
    }

    // PAGINATION LOGIC
    const paginationContainer = table.parentElement.parentElement.querySelector(
      ".pagination-controls"
    );
    const totalRows = data.length;
    const totalPages = Math.ceil(totalRows / this.rowsPerPage);
    if (this.currentPage > totalPages) this.currentPage = totalPages || 1;
    const start = (this.currentPage - 1) * this.rowsPerPage;
    const end = start + this.rowsPerPage;
    const paginatedData = data.slice(start, end);

    if (!paginatedData || paginatedData.length === 0) {
      table.innerHTML = `<tr><td colspan="${
        columns.length + actions.length
      }">No data found.</td></tr>`;
    } else {
      table.innerHTML = paginatedData
        .map((item) => {
          // Format the images column
          const imagesCell = columns.includes("images")
            ? `<td>
                  ${
                    item.images && item.images.length > 0
                      ? item.images
                          .map(
                            (image) =>
                              `<img src="${image.url}" alt="${item.name}" style="width: 50px; height: 50px; margin-right: 5px;">`
                          )
                          .join("")
                      : "No images"
                  }
                </td>`
            : "";

          // Format the products column
          const productsCell = columns.includes("products")
            ? `<td>${this.formatProducts(item.products)}</td>`
            : "";

          return `
            <tr>
              ${columns
                .map((col) => {
                  if (col === "images") {
                    return imagesCell;
                  } else if (col === "products") {
                    return productsCell;
                  } else {
                    return `<td>${item[col] || "N/A"}</td>`;
                  }
                })
                .join("")}
              <td>
                ${actions
                  .map(
                    (action) =>
                      `<button class="${action.class}" onclick="${action.onclick}('${item.id}')">${action.text}</button>`
                  )
                  .join("")}
              </td>
            </tr>
          `;
        })
        .join("");
    }

    // PAGINATION CONTROLS
    if (paginationContainer) {
      const prevBtn = paginationContainer.querySelector(".prev-page");
      const nextBtn = paginationContainer.querySelector(".next-page");
      const pageInfo = paginationContainer.querySelector(".page-info");
      if (pageInfo) {
        pageInfo.textContent = `Page ${this.currentPage} of ${totalPages || 1}`;
      }
      if (prevBtn) {
        prevBtn.disabled = this.currentPage === 1;
        prevBtn.onclick = () => {
          if (this.currentPage > 1) {
            this.currentPage--;
            this.renderTable(data, tableId, columns, actions);
          }
        };
      }
      if (nextBtn) {
        nextBtn.disabled = this.currentPage === totalPages || totalPages === 0;
        nextBtn.onclick = () => {
          if (this.currentPage < totalPages) {
            this.currentPage++;
            this.renderTable(data, tableId, columns, actions);
          }
        };
      }
    }
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
}

// Get the seller ID from the URL
const sellerId = getQueryParam("sellerId");
// Function to get query parameters from the URL
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

window.dashboardSeller = new DashboardSeller(sellerId);
window.dashboardSeller.init();
