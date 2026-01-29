const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const xlsx = require("xlsx");

const app = express();
app.use(express.json());
app.use(cors());
// 1. Multer Setup (File handling ke liye)
const upload = multer({ storage: multer.memoryStorage() });

// 2. Excel Upload Route
app.post("/api/results/upload", upload.single("file"), async (req, res) => {
    try {
        const { user } = req.query; // Admin ka naam URL se
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });

        // Excel file read karein
        const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        // Database mein data save karein
        if (data.length > 0) {
            await Result.insertMany(data); // Bulk Insert (Faster)
            
            // Audit Log create karein
            await Log.create({ 
                userName: user || "Admin", 
                action: `Uploaded Excel with ${data.length} records` 
            });

            res.json({ success: true, message: `Successfully uploaded ${data.length} records! ✅` });
        } else {
            res.status(400).json({ message: "Excel file is empty!" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error processing Excel file" });
    }
});

// --- MONGODB CONNECTION ---
// Dhan rakhein: Password mein @ ho toh use Atlas mein jaakar change kar lein ya encode karein.
const dbURI = "mongodb+srv://SKPS9389:SKPS1234@skps-result.dizwgco.mongodb.net/skpsResultDB?retryWrites=true&w=majority";

// 2. Database Connection (Sirf ek baar)
mongoose.connect(dbURI)
  .then(() => console.log("Cloud MongoDB Connected! ✅"))
  .catch(err => console.log("Database Error: ", err.message));


// --- SCHEMAS ---
const resultSchema = new mongoose.Schema({
    rollNo: String, regNo: String, name: String, fatherName: String, 
    dob: String, totalQuestions: Number, correct: Number, wrong: Number, totalMarks: Number
});
const Result = mongoose.model("Result", resultSchema);

const logSchema = new mongoose.Schema({
    userName: String, action: String, timestamp: { type: Date, default: Date.now }
});
const Log = mongoose.model("Log", logSchema);

// --- ADMIN USERS (Same as your DB IDs) ---
const users = [
    { username: "Admin", password: "SKPS@9389" },
    { username: "President", password: "SKPS@9389" },
    { username: "Founder", password: "SKPS@9389" }
];

// --- ROUTES ---

// 1. Login
app.post("/api/admin/login", (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (user) res.json({ success: true, username: user.username });
    else res.status(401).json({ success: false, message: "Invalid ID/Password" });
});

// 2. Student Search (Roll or DOB)
app.get("/api/results/search", async (req, res) => {
    const { rollNo, dob } = req.query;
    const result = await Result.findOne({ $or: [{ rollNo: rollNo?.trim() }, { dob: dob?.trim() }] });
    if (result) res.json(result);
    else res.status(404).json({ message: "Not Found" });
});

// 3. Delete + Logging
app.delete("/api/results/delete/:id", async (req, res) => {
    const { adminUser } = req.query;
    const deleted = await Result.findByIdAndDelete(req.params.id);
    if (deleted) {
        await Log.create({ userName: adminUser, action: `Deleted: ${deleted.name} (${deleted.rollNo})` });
        res.json({ success: true });
    }
});



// 4. Fetch Logs & Data
app.get("/api/results/all", async (req, res) => res.json(await Result.find()));
app.get("/api/admin/logs", async (req, res) => res.json(await Log.find().sort({timestamp:-1}).limit(20)));

app.listen(5000, "0.0.0.0", () => console.log("Server: http://Localhost:5000"));
