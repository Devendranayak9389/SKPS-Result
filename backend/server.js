const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const xlsx = require("xlsx");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());

const upload = multer({ storage: multer.memoryStorage() });

const dbURI = "mongodb+srv://SKPS9389:SKPS1234@skps-result.dizwgco.mongodb.net/skpsResultDB?retryWrites=true&w=majority";

mongoose.connect(dbURI)
  .then(() => console.log("Cloud MongoDB Connected! ✅"))
  .catch(err => console.log("Database Error: ", err.message));

const resultSchema = new mongoose.Schema({
    rollNo: String, regNo: String, name: String, fatherName: String, 
    dob: String, totalQuestions: Number, correct: Number, wrong: Number, totalMarks: Number
});
const Result = mongoose.model("Result", resultSchema);

const logSchema = new mongoose.Schema({
    userName: String, action: String, timestamp: { type: Date, default: Date.now }
});
const Log = mongoose.model("Log", logSchema);

const users = [
    { username: "Admin", password: "SKPS@9389" },
    { username: "President", password: "SKPS@9389" },
    { username: "Founder", password: "SKPS@9389" }
];

app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "index.html"));
});

app.post("/api/admin/login", (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (user) res.json({ success: true, username: user.username });
    else res.status(401).json({ success: false, message: "Invalid ID/Password" });
});

app.get("/api/results/search", async (req, res) => {
    const { rollNo, dob } = req.query;
    const result = await Result.findOne({ $or: [{ rollNo: rollNo?.trim() }, { dob: dob?.trim() }] });
    if (result) res.json(result);
    else res.status(404).json({ message: "Not Found" });
});

app.post("/api/results/upload", upload.single("file"), async (req, res) => {
    try {
        const { user } = req.query;
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });
        const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
        if (data.length > 0) {
            await Result.insertMany(data);
            await Log.create({ userName: user || "Admin", action: `Uploaded ${data.length} records` });
            res.json({ success: true, message: `Successfully uploaded ${data.length} records!` });
        } else {
            res.status(400).json({ message: "Excel file is empty!" });
        }
    } catch (err) {
        res.status(500).json({ message: "Error processing Excel file" });
    }
});

app.delete("/api/results/delete/:id", async (req, res) => {
    const { adminUser } = req.query;
    const deleted = await Result.findByIdAndDelete(req.params.id);
    if (deleted) {
        await Log.create({ userName: adminUser, action: `Deleted: ${deleted.name} (${deleted.rollNo})` });
        res.json({ success: true });
    }
});

app.get("/api/results/all", async (req, res) => res.json(await Result.find()));
app.get("/api/admin/logs", async (req, res) => res.json(await Log.find().sort({timestamp:-1}).limit(20)));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
