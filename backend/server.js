const express = require("express");
const app = express();
const cors = require("cors");
const axios = require("axios");
const port = process.env.PORT || 5000;
const sharp = require("sharp");

// Hashmap to be used to cache webp images
let cache = {};

// CorsOptions to allow for requests to only be received by the frontend
const corsOptions = {
  origin: "http://localhost:3000",
};
app.use(cors(corsOptions));

// This displays message that the server running and listening to the specified port
app.listen(port, () => console.log(`Listening on port ${port}`));

// Get all legislators image endpoint
app.get("/get-legislator-img/:bioguide", async (req, res) => {
  const { bioguide } = req.params;
  let url = `https://theunitedstates.io/images/congress/225x275/${bioguide}.jpg`;
  let response;

  try {
    // If an image with the key of the url is cached then return the webp image from cache
    // If no image is present for the url we fetch th jpeg, convert to webp then save to our cache
    if (cache[url]) {
      response = cache[url];
    } else {
      // Getting legislator jpeg image
      const legislatorJPEG = await axios.get(url, {
        responseType: "arraybuffer",
      });

      // Converting legislator Jpeg to a webp then saving it to the cache.
      const webpImageAsBuffer = await sharp(legislatorJPEG.data)
        .webp({ lossless: true })
        .toBuffer();

      // Saving webp image to the cache and to the response object
      cache[url] = webpImageAsBuffer;
      response = webpImageAsBuffer;
    }

    // Setting content type and returning the webp image
    res.setHeader("content-type", "image/webp");
    res.send(response);
  } catch (error) {
    console.log(
      "method='/get-legislator-img/:bioguide' error=",
      error.response.statusText
    );
    res.status(404).json({ error: error.response.statusText });
  }
});

// Get all legislators endpoint
app.get("/get-legislators", async (req, res) => {
  let legislators = [];

  const legislatorsResponse = await axios.get(
    `https://theunitedstates.io/congress-legislators/legislators-current.json`
  );
  legislators = legislatorsResponse.data;

  res.send({ legislators });
});
