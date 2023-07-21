const { execSync } = require("child_process");

// Depends on librsvg and imagemagick
// brew install librsvg
// brew install imagemagick

function convertSvgToPng(input, output, height) {
  const command = `rsvg-convert -h ${height} ${input} > ${output}`;
  execSync(command);
}

const sizes = [16, 32, 48, 128, 256];

const SVG_PATH = "./extension/icons/icon.svg";

function generateIcons() {
  sizes.forEach((size) => {
    convertSvgToPng(SVG_PATH, `./extension/icons/${size}.png`, size);
  });
}

generateIcons();
