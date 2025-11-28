const mongoose = require("mongoose");
const Config = require("./models/Config");
require("dotenv").config();

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  
  await Config.updateOne(
    { key: "referralReward" },
    { value: 50 },
    { upsert: true }
  );

  console.log("Reward value set to 50 coins.");
  process.exit(0);
})();
