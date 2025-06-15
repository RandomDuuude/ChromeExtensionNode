const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const axios = require("axios");
const { log } = require("console");
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
  console.log("Images:", images);

  try {
    // Download each image as a buffer (blob)
    const imageBlobs = await Promise.all(
      images.map(async (url) => {
        const response = await axios.get(url, { responseType: "arraybuffer" });
        return Buffer.from(response.data, "binary");
      })
    );
    try {
      // Send data to detection endpoint
      const response = await axios.post("http://localhost:6000/detect", {
        keyword,
        imageBlobs,
      });

      res.json({
        message: "Product data received and sent to detection!",
        data: { keyword, imageBlobs },
        detectionResponse: response.data,
      });
      console.log(res);
      console.log("Sent to detect");
    } catch (error) {
      console.error("Error sending data to detection:", error);
      res.status(500).json({
        message: "Error sending data to detection",
        error: error.message,
      });
    }
  } catch (error) {
    console.error("Error downloading images:", error);
    return res.status(500).send("Failed to download one or more images.");
  }
});

app.post("/getImage", upload.single("filename"), async (req, res) => {
  if (!req.file) {
    console.log("Didn't work Shuvam");
    return res.status(400).send("No file uploaded.");
  }

  // Create the full URL for accessing the image
  let imageUrl = `http://localhost:3000/uploads/${req.file.filename}`;
  console.log(imageUrl);

  try {
    image = await axios.get(imageUrl, { responseType: "arraybuffer" });
    imageUrl = Buffer.from(image.data);
    console.log(imageUrl);
    console.log("Hello 2469950" + imageUrl.data);
    // Send data to detection endpoint
    const response = await axios.post("http://localhost:6000/background", {
      imageUrl,
    });
    res.json({
      message: "Product data received and sent to detection!",
      data: imageUrl,
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

// Start server
app.listen(3000, () => {
  console.log("API running on http://localhost:3000");
});
