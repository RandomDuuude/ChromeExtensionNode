const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const axios = require("axios");
const upload = multer({ dest: "uploads/" });

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Endpoint to receive product data with multiple images
app.post("/store-product", async (req, res) => {
  const { title, images, keyword } = req.body;

  console.log("Received product data:");
  console.log("Title:", title);
  console.log("Keyword:", keyword);
  console.log("Images:", images); // Logs all image URLs
  const now = new Date();
  console.log(
    `Current Time: ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
  );

  try {
    // Send data to detection endpoint
    const response = await axios.post("http://192.168.26.159:5000/detect", {
      keyword,
      images,
    });

    res.json({
      message: "Product data received and sent to detection!",
      data: { keyword, images },
      detectionResponse: response.data,
    });
    console.log("Sent to detect");
  } catch (error) {
    console.error("Error sending data to detection:", error);
    res.status(500).json({
      message: "Error sending data to detection",
      error: error.message,
    });
  }
});

app.post("/getImage", upload.single("filename"), async (req, res) => {
  if (!req.file) {
    console.log("Didn't work Shuvam");
    return res.status(400).send("No file uploaded.");
  }

  // Create the full URL for accessing the image
  const imageUrl = `http://localhost:3000/uploads/${req.file.filename}`;
  console.log(imageUrl);
});

// Start server
app.listen(3000, () => {
  console.log("API running on http://localhost:3000");
});
