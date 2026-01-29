const express = require("express");
const multer = require("multer");
const xlsx = require("xlsx");
const Result = require("../models/Result");
const router = express.Router();

// Memory storage use karein taaki disk par file write na ho (Super Fast)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/* ADMIN: Excel Upload */
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    // Direct buffer se read karein (No disk lag)
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    if (data.length === 0) return res.status(400).json({ message: "Excel sheet is empty" });

    // Database operation (Fresh start)
    await Result.deleteMany({});
    await Result.insertMany(data, { ordered: false }); // Ordered: false se speed badhti hai

    res.json({ message: `Successfully uploaded ${data.length} records!` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error processing file", error: err.message });
  }
});

/* STUDENT: Search Result */
router.get("/search", async (req, res) => {
  try {
    const { rollNo, dob } = req.query;
    if (!rollNo || !dob) return res.status(400).json({ message: "Details missing" });

    // Trim aur string conversion taaki match pakka ho
    const result = await Result.findOne({ 
      rollNo: String(rollNo).trim(), 
      dob: String(dob).trim() 
    });

    if (!result) return res.status(404).json({ message: "No record found." });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Admin routes ko module.exports se pehle rakhein
router.get("/all", async (req, res) => {
    const results = await Result.find().sort({ name: 1 });
    res.json(results);
});

router.delete("/delete/:id", async (req, res) => {
    await Result.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
});

module.exports = router;
router.post("/upload", upload.single("file"), async (req, res) => {
  console.log("File received!"); // <-- Ye line add karein
  try {
    // ... baki code ...
    console.log("Data parsed:", data.length, "rows found"); // <-- Ye line bhi
    await Result.insertMany(data);
    console.log("Data saved to DB!"); // <-- Aur ye bhi
    res.json({ message: "Success!" });
  } catch (err) {
    console.log("Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});