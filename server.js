const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const axios = require("axios");
const fs = require("fs");
const upload = multer({ dest: "uploads/" });

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Function to convert image URL to binary data
async function getImageBinary(imageUrl) {
  if (imageUrl.startsWith("http")) {
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    return Buffer.from(response.data).toString("base64");
  } else {
    // For local files
    const localPath = imageUrl.replace("http://localhost:3000", "");
    const fullPath = path.join(__dirname, localPath);
    return fs.readFileSync(fullPath).toString("base64");
  }
}

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
    // Convert all images to binary
    const binaryImages = await Promise.all(images.map(getImageBinary));

    // Send data to detection endpoint
    console.log(binaryImages);
    const response = await axios.post("http://192.168.26.159:5000/detect", {
      title,
      images: binaryImages,
      keyword,
    });

    res.json({
      message: "Product data received and sent to detection!",
      data: { title, images, keyword },
      detectionResponse: response.data,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({
      message: "Error processing request",
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

  try {
    // Convert uploaded image to binary
    const binaryImage = await getImageBinary(imageUrl);

    // Send the image binary to detection endpoint
    const response = await axios.post("http://192.168.26.159:5000/detect", {
      images: [binaryImage],
    });

    res.send({
      message: "File uploaded successfully and sent to detection!",
      imageUrl: imageUrl,
      detectionResponse: response.data,
    });
  } catch (error) {
    console.error("Error processing image:", error);
    res.status(500).json({
      message: "Error processing image",
      error: error.message,
    });
  }
});

// Start server
app.listen(3000, () => {
  console.log("API running on http://localhost:3000");
});
