const http = require("http");
const fs = require("fs");
const path = require("path");
const getAllImages = require("./imageSearch.js");

const baseDir = __dirname; // change this to C:\Users\username\Desktop\images or whatever you want
const imageDir = "images";

// if imageDir does not exist, create it
if(fs.existsSync(imageDir) === false) {
  fs.mkdirSync(imageDir);
}

const getImages = async () => {
  // Read current directory
  const images = await getAllImages(baseDir, imageDir);
  return images;
};

const getRandomDogImage = async () => {
  const randomDogImage = await fetch("https://dog.ceo/api/breeds/image/random");
  const randomDogImageJson = await randomDogImage.json();
  return randomDogImageJson.message;
};

const getRandomImage = async (images) => {
  // no local files? get a random dog image
  if (images.length === 0) {
    return {
      is404: true,
      image: await getRandomDogImage(),
    };
  }

  // Select a random file
  const randomIndex = Math.floor(Math.random() * images.length);
  const randomFile = images[randomIndex];
  return {
    is404: false,
    image: `images/${randomFile}`,
  };
};

// Create HTTP server
const server = http.createServer(async (req, res) => {
  const images = await getImages();
  // if requested image is in image folder, then use that image

  try {
    if (req.url.includes(`/images/`)) {
      const image = req.url.replace("/images/", "");
      if (images.includes(image)) {
        const imageContent = fs.readFileSync(path.join(baseDir, image));
        res.setHeader("Content-Type", "image/png");
        res.end(imageContent);
        return;
      }
    }
  } catch (err) {
    console.log(err);
  }

  // otherwise, show random image page
  // Select a random file
  const { is404, image } = await getRandomImage(images);

  // Create basic HTML content
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Random File</title>
      </head>
      <body>
        ${is404 ? `<h1>404</h1>` : ""}
        <img src="${image}" />
      </body>
    </html>

    <style>
      body {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100vh;
        margin: 0;
      }

      body > img {
        max-width: 50%;
        max-height: 50%;
      }
    </style>
  `;

  res.setHeader("Content-Type", "text/html");
  res.end(html);
});

// Start server
server.listen(3000, () => {
  console.log("Server started at http://localhost:3000/");
});
