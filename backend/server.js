const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
// Agar image/excel upload karna hai toh uploads folder ko public banayein
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 1. Connection String (Make sure Password is changed in Atlas to SKPS1234)
const dbURI = "mongodb+srv://SKPS9389:SKPS1234@skps-result.dizwgco.mongodb.net/skpsResultDB?retryWrites=true&w=majority";

// 2. Database Connection (Sirf ek baar)
mongoose.connect(dbURI)
  .then(() => console.log("Cloud MongoDB Connected! ✅"))
  .catch(err => console.log("Database Error: ", err.message));

// 3. Routes
// Dhyaan rakhein ki aapka routes folder aur file sahi jagah ho
app.use("/api/results", require("./routes/resultRoutes"));

// 4. Server Start (Port 5000 use karein)
const PORT = 5000; 
app.listen(PORT, () => {
  console.log(`SKPS Server running on http://192.168.0.138:${PORT}`);
});
// Ye line routes se upar add karein
app.get("/", (req, res) => {
  res.send("SKPS Backend Server is Running Successfully! 🚀");
});
app.listen(5000, "0.0.0.0", () => {
  console.log("Server is live on network!");
});