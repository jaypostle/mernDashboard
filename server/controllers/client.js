import Product from "../models/Product.js";
import ProductStat from "../models/ProductStat.js";
import User from "../models/User.js";

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find(); // tells mongo I want all list of products
    const productsWithStats = await Promise.all(
      // take id of each product, and get the product stat of each product, relative to the _id (foreign key)
      products.map(async (product) => {
        const stat = await ProductStat.find({
          productId: product._id,
        });

        return {
          // creates an array of objects that will each have the product info + product stat info in one object
          ...product._doc, // product info
          stat, // product stat info
        };
      })
    );

    res.status(200).json(productsWithStats);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: "user" }).select("-password"); // we don't want to include the password when we send it to the front
    res.status(200).json(customers);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
