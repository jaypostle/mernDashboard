import Product from "../models/Product.js";
import ProductStat from "../models/ProductStat.js";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import getCountryIso3 from "country-iso-2-to-3";

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

export const getGeography = async (req, res) => {
  try {
    const users = await User.find();

    // we need to convert the data's 2 digit country code to 3 digit using the country-iso-2-to-3 npm package
    const mappedLocations = users.reduce((acc, { country }) => {
      // for every user, grab the country value, convert it to iso3 format, and add it to the object if it doesn't exist, add it to the object and increase the value by 1
      const countryISO3 = getCountryIso3(country);
      if (!acc[countryISO3]) {
        acc[countryISO3] = 0; // if the country doesn't already exist, set value to 0
      }
      acc[countryISO3]++;
      return acc;
    }, {});

    // still not in format we need so:
    const formattedLocations = Object.entries(mappedLocations).map(
      // object.entries looks at the key/value pairs of the passed in object of mappedLocations and does something to it
      ([country, count]) => {
        // country is the key, count is the value
        return { id: country, value: count }; // proper format nivo needs
      }
    );
    res.status(200).json(formattedLocations);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
