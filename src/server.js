import "dotenv/config";

import app from "./app.js";
import connectDB from "./config/database.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Database
    await connectDB();

    // Server
    app.listen(PORT, () => {
      console.log("======================================");
      console.log(`Server running on port ${PORT}`);
      console.log("======================================");
    });
  } catch (error) {
    console.error("======================================");
    console.error("SERVER START FAILED");
    console.error(error);
    console.error("======================================");

    process.exit(1);
  }
};

startServer();