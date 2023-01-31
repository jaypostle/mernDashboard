import Product from "../models/Product.js";
import ProductStat from "../models/ProductStat.js";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";

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

export const getTransactions = async (req, res) => {
  try {
    // grab values from query string
    // the sort should look like this: {"field": "userId", "sort": "desc", } // this is what we'll get from material UI datagrid
    const { page = 1, pageSize = 20, sort = null, search = "" } = req.query;

    // formatted Sort should look like this { userId: -1 } // this is what mongo db will be able to read
    const generateSort = () => {
      const sortParsed = JSON.parse(sort);
      const sortFormatted = {
        [sortParsed.field]: (sortParsed.sort = "asc" ? 1 : -1),
      };
      return sortFormatted;
    };
    const sortFormatted = Boolean(sort) ? generateSort() : {};

    // Transactions search
    const transactions = await Transaction.find({
      $or: [
        // $or allows us to search for multiple fields
        { cost: { $regex: new RegExp(search, "i") } }, // if we want to search, we search for the cost param with the search term they inputted. The or allows us to search multiple fields
        { userId: { $regex: new RegExp(search, "i") } }, // searching for userId
      ],
    })
      .sort(sortFormatted) // sort based on the formatting created above
      .skip(page * pageSize) // determines the page number/ total transactions to show
      .limit(pageSize);

    const total = await Transaction.countDocuments({
      name: { $regex: search, $options: "i" }, //
    });

    res.status(200).json({
      transactions,
      total,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
