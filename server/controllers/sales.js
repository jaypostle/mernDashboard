import OverallStat from "../models/OverallStat.js";

export const getSales = async (req, res) => {
  try {
    const overallStats = await OverallStat.find();
    res.status(200).json(overallStats[0]); // send the first index of the array
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: err.message });
  }
};
