const fs = require("fs").promises;
const path = require("path");

const imagesRegex = /\.(gif|jpe?g|tiff?|png|webp|bmp)$/i;

// Check if the file is an image
const isImage = (file) => {
  return path.extname(file).match(imagesRegex);
};

// Recursively get all images from a directory
const getImages = async (baseDir, relativeDir) => {
  const currentDir = path.join(baseDir, relativeDir);
  const files = await fs.readdir(currentDir);
  const images = [];

  for (const file of files) {
    const filePath = path.join(currentDir, file);
    const stat = await fs.stat(filePath);

    if (stat.isDirectory()) {
      const subDirImages = await getImages(baseDir, path.join(relativeDir, file));
      images.push(...subDirImages);
    } else if (stat.isFile() && isImage(file)) {
      images.push(path.join(relativeDir, file));
    }
  }

  return images;
};

module.exports = getImages;
