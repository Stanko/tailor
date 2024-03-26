import { execSync } from "child_process";

// Depends on librsvg

// brew install librsvg

const convertSvgToPng = (input, output, height) => {
  const command = `rsvg-convert -h ${height} ${input} > ${output}`;
  execSync(command);
};

const sizes = [16, 32, 48, 128, 256];

const generateIcons = (folderPath) => {
  const svgPath = `${folderPath}/icon.svg`;

  sizes.forEach((size) => {
    convertSvgToPng(svgPath, `${folderPath}/${size}.png`, size);
  });
};

const BLUE_PATH = "./extension/icons/blue";
const GRAY_PATH = "./extension/icons/gray";

generateIcons(BLUE_PATH);
generateIcons(GRAY_PATH);
