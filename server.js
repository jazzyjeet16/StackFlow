
require("dotenv").config();
const app = require("./src/app");


// Import database connection
require("./src/config/db");

// Get port from environment variables
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
    console.log(`StockFlow server running on port ${PORT}`);
});
