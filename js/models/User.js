export class User {
    constructor(id, name, email,password, role, approved = false) {
      this.id = id;
      this.name = name;
      this.email = email;
      this.password = password
      this.role = role;
      this.approved = approved;
    }
  
    static async fetchAll() {
      const response = await fetch("http://localhost:3000/users");
      if (!response.ok) throw new Error("Failed to fetch users.");
      return (await response.json()).map(user => new User(user.id, user.name, user.email,user.password, user.role, user.approved));
    }
  
    static async fetchById(id) {
      console.log("Fetching user with ID:", id); // Debug log
      const response = await fetch(`http://localhost:3000/users/${id}`);
      if (!response.ok) throw new Error(`Failed to fetch user with ID ${id}.`);
      const user = await response.json();
      console.log("Fetched user data:", user); // Debug log
      return new User(user.id, user.name, user.email, user.password, user.role, user.approved);
    }
  
    async update(updatedData) {
      const response = await fetch(`http://localhost:3000/users/${this.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      if (!response.ok) throw new Error("Failed to update user.");
      return response.json();
    }
  
    async approve() {
      const updatedData = { ...this, approved: true };
      return this.update(updatedData);
    }
  
    async delete() {
      const response = await fetch(`http://localhost:3000/users/${this.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete user.");
      return response.json();
    }
  }