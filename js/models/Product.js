export class Product {
    constructor(id, name, price, category, sellerId, approved, images = []) {
      this.id = id;
      this.name = name;
      this.price = price;
      this.category = category;
      this.sellerId = sellerId;
      this.approved = approved;
      this.images = images; 
    }
  
    // Fetch all products
    static async fetchAll() {
      const response = await fetch("http://localhost:3000/products");
      if (!response.ok) throw new Error("Failed to fetch products.");
      return (await response.json()).map(
        (product) =>
          new Product(
            product.id,
            product.name,
            product.price,
            product.category,
            product.sellerId,
            product.approved,
            product.images
          )
      );
    }
  
    // Fetch a product by ID
    static async fetchById(id) {
      const response = await fetch(`http://localhost:3000/products/${id}`);
      if (!response.ok) throw new Error(`Failed to fetch product with ID ${id}.`);
      const product = await response.json();
      return new Product(
        product.id,
        product.name,
        product.price,
        product.category,
        product.sellerId,
        product.approved,
        product.images
      );
    }
  
    // Approve a product
    async approve() {
      const updatedData = { ...this, approved: true };
      const response = await fetch(`http://localhost:3000/products/${this.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      if (!response.ok) throw new Error("Failed to approve product.");
      return response.json();
    }
  
    // Delete a product
    async delete() {
      const response = await fetch(`http://localhost:3000/products/${this.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete product.");
      return response.json();
    }
  
    // Update a product
    async update(updatedData) {
      const response = await fetch(`http://localhost:3000/products/${this.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      if (!response.ok) throw new Error("Failed to update product.");
      return response.json();
    }
  
      // Add a new product (static method)
      static async addProduct(productData) {
        const maxId = await this.getMaxId(); // Fetch the maximum ID
        const newId = String(maxId + 1); // Generate the next ID
      
        const newProductData = {
          id: newId, // Include the generated ID
          ...productData, // Include the rest of the product data
        };
      
        const response = await fetch("http://localhost:3000/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newProductData), // Send the new product data with the generated ID
        });
      
        if (!response.ok) throw new Error("Failed to add product.");
      
        // Parse the response to get the newly created product
        const newProduct = await response.json();
        return newProduct; // Return the product with the generated ID
      }
  
      static async getMaxId() {
        const products = await this.fetchAll(); // Fetch all products
        if (products.length === 0) return 0; // If no products, start with ID 1
        return Math.max(...products.map((product) => product.id)); // Return the maximum ID
      }
  }