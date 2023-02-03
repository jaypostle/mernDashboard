import mongoose, { Mongoose } from "mongoose";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";

export const getAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" }).select("-password");
    res.status(200).json(admins);
  } catch (err) {
    // console.log(err);
    res.status(404).json({ message: err.message });
  }
};

// Aggregate Calls!
export const getUserPerformance = async (req, res) => {
  try {
    const { id } = req.params;
    // aggregate() allows us to use the "aggregation pipeline"
    const userWithStats = await User.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } }, // we grab the user id, convert it to the right format for mongo db, find the user that has that id
      {
        $lookup: {
          from: "affiliatestats",
          localField: "_id", // since we're looking at the user table, this is the local field.
          foreignField: "userId", // then we compare it to the foreign field (userId) in the affiliate stats db
          as: "affiliateStats", // Essentially: which affiliate stats are referenced by which user?
        },
      },
      { $unwind: "$affiliateStats" }, // flattens the array
    ]);

    const saleTransactions = await Promise.all(
      userWithStats[0].affiliateStats.affiliateSales.map((id) => {
        return Transaction.findById(id); // for each stat, we grab each sale transaction, and pass the transactions we get
      })
    );
    const filterSaleTransactions = saleTransactions.filter(
      (transaction) => transaction !== null // make sure no items are null
    );

    res
      .status(200)
      .json({ user: userWithStats[0], sales: filterSaleTransactions });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
