// src/models/Product.js
export default class Product {
    constructor(id, name, categoryId, price, quantity, rating) {
      this.id = id;
      this.name = name;
      this.categoryId = categoryId;
      this.price = price;
      this.quantity = quantity;
      this.rating = rating;
    }
  }
  