const express = require("express");
require("dotenv").config();
const connectToDatabase = require("./config/db");
const authRouter = require("./routes/authRoute");
const addressRouter = require("./routes/addressRoute");
const orderRouter = require("./routes/ordersRoute");
const paymentRouter = require("./routes/paymentRoute");
const uploadRouter = require("./routes/uploadRoute");
const confirmPickupRouter = require("./routes/confirmPickupRoute");
const subscriptionRouter = require("./routes/subscriptionRoute");
const promocode = require("./routes/promocodeRoute");
const sendMail = require("./routes/sendMailRoute");
const googlesheet = require("./routes/googleSheetRoute");
const passport = require('passport');
const session = require('express-session');
const passportConfig = require('./utils/passport');
const app = express();
const cors = require("cors");
app.use(cors()); // REMOVE LATER THE ORIGIN *
app.use("/uploads", express.static("uploads"));
app;

const port = process.env.PORT || 3000;

connectToDatabase();

app.use(session({
    secret: 'c24e45cb63310811e8cabc4026919dc39f0bdd65f18af20fdf477782ba4c195f',
    resave: false,
    saveUninitialized: true
  }));
  
  app.use(passport.initialize());
  app.use(passport.session());
  

app.use("/api/payment", paymentRouter);
app.use(express.json());
// API routes
app.use("/api", authRouter);
app.use("/api/orders", orderRouter);
app.use("/api/return-labels", uploadRouter);
app.use("/api/address", addressRouter);
app.use("/api/confirm-pickup", confirmPickupRouter);
app.use("/api/choose-plan", subscriptionRouter);
app.use("/api/promocode", promocode);
app.use("/api/sendmail", sendMail);
app.use("/api/updategooglesheet", googlesheet);

app.use("/",(req,res)=>{
  res.status(200).json({msg:"success",server:"Running..."});
})

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port # ${port}`);
});
