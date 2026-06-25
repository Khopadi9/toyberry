const Cart = require('../models/Cart');
const Product = require('../models/Product');

class CartService {
  async getOrCreateCart(userId, sessionId) {
    let cart = null;
    if (userId) {
      cart = await Cart.findOne({ user: userId }).populate('items.product');
      if (!cart) {
        cart = await Cart.create({ user: userId, items: [] });
      }
    } else if (sessionId) {
      cart = await Cart.findOne({ sessionId }).populate('items.product');
      if (!cart) {
        cart = await Cart.create({ sessionId, items: [] });
      }
    }
    return cart;
  }

  async addToCart(userId, sessionId, productId, quantity = 1) {
    const cart = await this.getOrCreateCart(userId, sessionId);
    const product = await Product.findById(productId);
    if (!product) throw new Error('Product not found');
    if (product.stock < quantity) throw new Error('Insufficient stock available');

    const itemPrice = product.salePrice || product.price;
    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

    if (itemIndex > -1) {
      const newQty = cart.items[itemIndex].quantity + quantity;
      if (product.stock < newQty) throw new Error('Insufficient stock available');
      cart.items[itemIndex].quantity = newQty;
      cart.items[itemIndex].price = itemPrice;
    } else {
      cart.items.push({
        product: productId,
        quantity,
        price: itemPrice
      });
    }

    await cart.save();
    return await cart.populate('items.product');
  }

  async updateQuantity(userId, sessionId, productId, quantity) {
    const cart = await this.getOrCreateCart(userId, sessionId);
    const product = await Product.findById(productId);
    if (!product) throw new Error('Product not found');
    if (product.stock < quantity) throw new Error('Insufficient stock available');

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = quantity;
      cart.items[itemIndex].price = product.salePrice || product.price;
      await cart.save();
    } else {
      throw new Error('Item not in cart');
    }

    return await cart.populate('items.product');
  }

  async removeItem(userId, sessionId, productId) {
    const cart = await this.getOrCreateCart(userId, sessionId);
    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    await cart.save();
    return await cart.populate('items.product');
  }

  async mergeCart(sessionId, userId) {
    if (!sessionId || !userId) return;

    const guestCart = await Cart.findOne({ sessionId });
    if (!guestCart || guestCart.items.length === 0) return;

    const userCart = await this.getOrCreateCart(userId, null);

    for (const guestItem of guestCart.items) {
      const userItemIndex = userCart.items.findIndex(
        item => item.product.toString() === guestItem.product.toString()
      );

      if (userItemIndex > -1) {
        userCart.items[userItemIndex].quantity += guestItem.quantity;
      } else {
        userCart.items.push({
          product: guestItem.product,
          quantity: guestItem.quantity,
          price: guestItem.price
        });
      }
    }

    await userCart.save();
    await Cart.deleteOne({ _id: guestCart._id });
  }

  async clearCart(userId, sessionId) {
    const cart = await this.getOrCreateCart(userId, sessionId);
    cart.items = [];
    await cart.save();
  }
}

module.exports = new CartService();
