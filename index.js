const express = require("express");
require("dotenv").config();
const connectToDatabase = require("./config/db");
const authRouter = require("./routes/authRoute");
const app = express();
const cors = require("cors");
app.use(cors()); // REMOVE LATER THE ORIGIN *
const port = process.env.PORT || 3000;

connectToDatabase();
app.use(express.json());
// API routes
app.use("/api", authRouter);


app.use("/",(req,res)=>{
  res.status(200).json({msg:"success",server:"Running..."});
})

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port # ${port}`);
});
