export class Order {
    constructor(id, customerName, products, address, date, total, status) {
      this.id = id;
      this.customerName = customerName;
      this.products = products; // Array of product objects
      this.address = address;
      this.date = date;
      this.total = total;
      this.status = status;
    }
  
    static async fetchAll() {
      const response = await fetch("http://localhost:3000/orders");
      if (!response.ok) throw new Error("Failed to fetch orders.");
      return (await response.json()).map(order => new Order(
        order.id,
        order.customerName,
        order.products,
        order.address,
        order.date,
        order.total,
        order.status
      ));
    }
  
    static async fetchById(id) {
      const response = await fetch(`http://localhost:3000/orders/${id}`);
      if (!response.ok) throw new Error(`Failed to fetch order with ID ${id}.`);
      const order = await response.json();
      return new Order(
        order.id,
        order.customerName,
        order.products,
        order.address,
        order.date,
        order.total,
        order.status
      );
    }
  
    async update(updatedData) {
      const response = await fetch(`http://localhost:3000/orders/${this.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      if (!response.ok) throw new Error("Failed to update order.");
      return response.json();
    }
  
    async delete() {
      const response = await fetch(`http://localhost:3000/orders/${this.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete order.");
      return response.json();
    }
  }